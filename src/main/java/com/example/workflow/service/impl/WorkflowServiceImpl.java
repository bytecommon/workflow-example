package com.example.workflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.dto.*;
import com.example.workflow.dto.enums.InstanceStatus;
import com.example.workflow.dto.enums.NodeType;
import com.example.workflow.dto.enums.TaskStatus;
import com.example.workflow.entity.*;

import com.example.workflow.mapper.*;
import com.example.workflow.service.WorkflowService;
import com.example.workflow.service.WorkflowEngineService;
import com.example.workflow.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 工作流服务实现
 */
@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {
    
    private final WorkflowDefinitionMapper workflowDefinitionMapper;
    private final WorkflowNodeMapper workflowNodeMapper;
    private final WorkflowEdgeMapper workflowEdgeMapper;
    private final WorkflowApproverMapper workflowApproverMapper;
    private final WorkflowInstanceMapper workflowInstanceMapper;
    private final WorkflowTaskMapper workflowTaskMapper;
    private final WorkflowHistoryMapper workflowHistoryMapper;
    private final WorkflowEngineService workflowEngineService;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createWorkflowDefinition(WorkflowDefinitionDTO dto) {
        WorkflowDefinition definition = new WorkflowDefinition();
        definition.setWorkflowKey(dto.getWorkflowKey());
        definition.setWorkflowName(dto.getWorkflowName());
        definition.setWorkflowDesc(dto.getWorkflowDesc());
        definition.setCategory(dto.getCategory());
        definition.setFormId(dto.getFormId());
        definition.setIcon(dto.getIcon());
        definition.setStatus(0); // 初始为停用状态
        definition.setVersion(1);
        
        workflowDefinitionMapper.insert(definition);
        return definition.getId();
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateWorkflowDefinition(Long id, WorkflowDefinitionDTO dto) {
        WorkflowDefinition definition = workflowDefinitionMapper.selectById(id);
        if (definition == null) {
            throw new RuntimeException("工作流不存在");
        }
        
        definition.setWorkflowName(dto.getWorkflowName());
        definition.setWorkflowDesc(dto.getWorkflowDesc());
        definition.setCategory(dto.getCategory());
        definition.setFormId(dto.getFormId());
        definition.setIcon(dto.getIcon());
        
        workflowDefinitionMapper.updateById(definition);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteWorkflowDefinition(Long id) {
        // 检查是否有运行中的实例
        Long count = workflowInstanceMapper.selectCount(
            new LambdaQueryWrapper<WorkflowInstance>()
                .eq(WorkflowInstance::getWorkflowId, id)
                .eq(WorkflowInstance::getStatus, InstanceStatus.RUNNING.name())
        );
        
        if (count > 0) {
            throw new RuntimeException("存在运行中的流程实例，无法删除");
        }
        
        workflowDefinitionMapper.deleteById(id);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void publishWorkflow(Long id) {
        WorkflowDefinition definition = workflowDefinitionMapper.selectById(id);
        if (definition == null) {
            throw new RuntimeException("工作流不存在");
        }
        
        // 验证工作流配置完整性
        validateWorkflowConfig(id);
        
        definition.setStatus(1);
        workflowDefinitionMapper.updateById(definition);
    }
    
    @Override
    public WorkflowDetailVO getWorkflowDetail(Long id) {
        WorkflowDefinition definition = workflowDefinitionMapper.selectById(id);
        if (definition == null) {
            throw new RuntimeException("工作流不存在");
        }
        
        WorkflowDetailVO vo = new WorkflowDetailVO();
        vo.setId(definition.getId());
        vo.setWorkflowKey(definition.getWorkflowKey());
        vo.setWorkflowName(definition.getWorkflowName());
        vo.setWorkflowDesc(definition.getWorkflowDesc());
        vo.setCategory(definition.getCategory());
        vo.setFormId(definition.getFormId());
        vo.setStatus(definition.getStatus());
        
        // 获取节点
        List<WorkflowNode> nodes = workflowNodeMapper.selectList(
            new LambdaQueryWrapper<WorkflowNode>()
                .eq(WorkflowNode::getWorkflowId, id)
        );
        vo.setNodes(nodes);
        
        // 获取连线
        List<WorkflowEdge> edges = workflowEdgeMapper.selectList(
            new LambdaQueryWrapper<WorkflowEdge>()
                .eq(WorkflowEdge::getWorkflowId, id)
        );
        vo.setEdges(edges);
        
        // 获取审批人配置
        if (!nodes.isEmpty()) {
            List<Long> nodeIds = nodes.stream()
                .map(WorkflowNode::getId)
                .collect(Collectors.toList());
            
            List<WorkflowApprover> approvers = workflowApproverMapper.selectList(
                new LambdaQueryWrapper<WorkflowApprover>()
                    .in(WorkflowApprover::getNodeId, nodeIds)
            );
            vo.setApprovers(approvers);
        }
        
        return vo;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveWorkflowConfig(Long workflowId, WorkflowConfigDTO config) {
        // 删除旧配置
        workflowNodeMapper.delete(
            new LambdaQueryWrapper<WorkflowNode>()
                .eq(WorkflowNode::getWorkflowId, workflowId)
        );
        
        // 保存节点
        if (config.getNodes() != null && !config.getNodes().isEmpty()) {
            for (WorkflowNode node : config.getNodes()) {
                node.setWorkflowId(workflowId);
                workflowNodeMapper.insert(node);
            }
        }
        
        // 保存连线
        workflowEdgeMapper.delete(
            new LambdaQueryWrapper<WorkflowEdge>()
                .eq(WorkflowEdge::getWorkflowId, workflowId)
        );
        
        if (config.getEdges() != null && !config.getEdges().isEmpty()) {
            for (WorkflowEdge edge : config.getEdges()) {
                edge.setWorkflowId(workflowId);
                workflowEdgeMapper.insert(edge);
            }
        }
        
        // 保存审批人配置
        if (config.getApprovers() != null && !config.getApprovers().isEmpty()) {
            for (WorkflowApprover approver : config.getApprovers()) {
                workflowApproverMapper.insert(approver);
            }
        }
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long startWorkflow(WorkflowStartDTO dto) {
        // 获取工作流定义
        WorkflowDefinition definition = workflowDefinitionMapper.selectOne(
            new LambdaQueryWrapper<WorkflowDefinition>()
                .eq(WorkflowDefinition::getId, dto.getWorkflowId())
                .eq(WorkflowDefinition::getStatus, 1)
        );
        
        if (definition == null) {
            throw new RuntimeException("工作流不存在或未启用");
        }
        
        // 创建流程实例
        WorkflowInstance instance = new WorkflowInstance();
        instance.setInstanceNo(generateInstanceNo());
        instance.setWorkflowId(definition.getId());
        instance.setWorkflowKey(definition.getWorkflowKey());
        instance.setWorkflowName(definition.getWorkflowName());
        instance.setFormId(definition.getFormId());
        instance.setFormData(dto.getFormData());
        instance.setStatus(InstanceStatus.RUNNING.name());
        instance.setStartUserId(dto.getStartUserId());
        instance.setStartUserName(dto.getStartUserName());
        instance.setTitle(dto.getTitle());
        instance.setPriority(dto.getPriority());
        instance.setBusinessKey(dto.getBusinessKey());
        
        workflowInstanceMapper.insert(instance);
        
        // 记录历史
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(instance.getId());
        history.setNodeId(0L);
        history.setNodeName("开始");
        history.setAction("START");
        history.setOperatorId(dto.getStartUserId());
        history.setOperatorName(dto.getStartUserName());
        history.setComment("发起流程");
        workflowHistoryMapper.insert(history);
        
        // 启动流程引擎，执行到第一个审批节点
        workflowEngineService.startProcess(instance.getId());
        
        return instance.getId();
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approveTask(Long taskId, TaskApproveDTO dto) {
        WorkflowTask task = workflowTaskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        
        if (!TaskStatus.PENDING.name().equals(task.getStatus())) {
            throw new RuntimeException("任务已处理");
        }
        
        // 更新任务状态
        task.setStatus(dto.isApproved() ? TaskStatus.APPROVED.name() : TaskStatus.REJECTED.name());
        task.setComment(dto.getComment());
        task.setAttachments(dto.getAttachments());
        task.setCompleteTime(LocalDateTime.now());
        workflowTaskMapper.updateById(task);
        
        // 记录历史
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(task.getInstanceId());
        history.setTaskId(task.getId());
        history.setNodeId(task.getNodeId());
        history.setNodeName(task.getNodeName());
        history.setAction(dto.isApproved() ? "APPROVE" : "REJECT");
        history.setOperatorId(dto.getOperatorId());
        history.setOperatorName(dto.getOperatorName());
        history.setComment(dto.getComment());
        history.setAttachments(dto.getAttachments());
        workflowHistoryMapper.insert(history);
        
        // 执行流程引擎
        workflowEngineService.processTask(task.getInstanceId(), taskId, dto.isApproved());
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void transferTask(Long taskId, TaskTransferDTO dto) {
        WorkflowTask task = workflowTaskMapper.selectById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        
        if (!TaskStatus.PENDING.name().equals(task.getStatus())) {
            throw new RuntimeException("任务已处理");
        }
        
        // 更新原任务为已转交
        task.setStatus(TaskStatus.TRANSFERRED.name());
        task.setComment("转交给：" + dto.getTargetUserName());
        task.setCompleteTime(LocalDateTime.now());
        workflowTaskMapper.updateById(task);
        
        // 创建新任务
        WorkflowTask newTask = new WorkflowTask();
        newTask.setInstanceId(task.getInstanceId());
        newTask.setInstanceNo(task.getInstanceNo());
        newTask.setNodeId(task.getNodeId());
        newTask.setNodeKey(task.getNodeKey());
        newTask.setNodeName(task.getNodeName());
        newTask.setNodeType(task.getNodeType());
        newTask.setAssigneeId(dto.getTargetUserId());
        newTask.setAssigneeName(dto.getTargetUserName());
        newTask.setStatus(TaskStatus.PENDING.name());
        newTask.setPriority(task.getPriority());
        workflowTaskMapper.insert(newTask);
        
        // 记录历史
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(task.getInstanceId());
        history.setTaskId(task.getId());
        history.setNodeId(task.getNodeId());
        history.setNodeName(task.getNodeName());
        history.setAction("TRANSFER");
        history.setOperatorId(dto.getOperatorId());
        history.setOperatorName(dto.getOperatorName());
        history.setComment("转交给：" + dto.getTargetUserName() + "。原因：" + dto.getReason());
        workflowHistoryMapper.insert(history);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelInstance(Long instanceId, String reason) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }
        
        if (!InstanceStatus.RUNNING.name().equals(instance.getStatus())) {
            throw new RuntimeException("流程已结束");
        }
        
        // 更新实例状态
        instance.setStatus(InstanceStatus.CANCELED.name());
        instance.setEndTime(LocalDateTime.now());
        workflowInstanceMapper.updateById(instance);
        
        // 取消待办任务
        workflowTaskMapper.update(null,
            new LambdaUpdateWrapper<WorkflowTask>()
                .eq(WorkflowTask::getInstanceId, instanceId)
                .eq(WorkflowTask::getStatus, TaskStatus.PENDING.name())
                    .set(WorkflowTask::getStatus, TaskStatus.CANCELED.name())
        );
        
        // 记录历史
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(instanceId);
        history.setNodeId(instance.getCurrentNodeId());
        history.setNodeName("撤销");
        history.setAction("CANCEL");
        history.setOperatorId(instance.getStartUserId());
        history.setOperatorName(instance.getStartUserName());
        history.setComment(reason);
        workflowHistoryMapper.insert(history);
    }
    
    @Override
    public Page<TaskVO> getMyPendingTasks(TaskQueryDTO query) {
        Page<WorkflowTask> page = new Page<>(query.getPageNum(), query.getPageSize());
        
        LambdaQueryWrapper<WorkflowTask> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkflowTask::getAssigneeId, query.getUserId())
               .eq(WorkflowTask::getStatus, TaskStatus.PENDING.name())
               .orderByDesc(WorkflowTask::getCreateTime);
        
        Page<WorkflowTask> taskPage = workflowTaskMapper.selectPage(page, wrapper);
        
        // 转换为VO
        Page<TaskVO> voPage = new Page<>();
        voPage.setCurrent(taskPage.getCurrent());
        voPage.setSize(taskPage.getSize());
        voPage.setTotal(taskPage.getTotal());
        
        List<TaskVO> voList = taskPage.getRecords().stream()
            .map(this::convertToTaskVO)
            .collect(Collectors.toList());
        voPage.setRecords(voList);
        
        return voPage;
    }
    
    @Override
    public Page<InstanceVO> getMyInstances(InstanceQueryDTO query) {
        Page<WorkflowInstance> page = new Page<>(query.getPageNum(), query.getPageSize());
        
        LambdaQueryWrapper<WorkflowInstance> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WorkflowInstance::getStartUserId, query.getUserId())
               .orderByDesc(WorkflowInstance::getStartTime);
        
        if (query.getStatus() != null) {
            wrapper.eq(WorkflowInstance::getStatus, query.getStatus());
        }
        
        Page<WorkflowInstance> instancePage = workflowInstanceMapper.selectPage(page, wrapper);
        
        // 转换为VO
        Page<InstanceVO> voPage = new Page<>();
        voPage.setCurrent(instancePage.getCurrent());
        voPage.setSize(instancePage.getSize());
        voPage.setTotal(instancePage.getTotal());
        
        List<InstanceVO> voList = instancePage.getRecords().stream()
            .map(this::convertToInstanceVO)
            .collect(Collectors.toList());
        voPage.setRecords(voList);
        
        return voPage;
    }
    
    @Override
    public InstanceDetailVO getInstanceDetail(Long instanceId) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }
        
        InstanceDetailVO vo = new InstanceDetailVO();
        vo.setId(instance.getId());
        vo.setInstanceNo(instance.getInstanceNo());
        vo.setWorkflowName(instance.getWorkflowName());
        vo.setStatus(instance.getStatus());
        vo.setFormData(instance.getFormData());
        vo.setStartUserId(instance.getStartUserId());
        vo.setStartUserName(instance.getStartUserName());
        vo.setStartTime(instance.getStartTime());
        vo.setEndTime(instance.getEndTime());
        vo.setTitle(instance.getTitle());
        
        return vo;
    }
    
    @Override
    public List<HistoryVO> getInstanceHistory(Long instanceId) {
        List<WorkflowHistory> histories = workflowHistoryMapper.selectList(
            new LambdaQueryWrapper<WorkflowHistory>()
                .eq(WorkflowHistory::getInstanceId, instanceId)
                .orderByAsc(WorkflowHistory::getOperateTime)
        );
        
        return histories.stream()
            .map(this::convertToHistoryVO)
            .collect(Collectors.toList());
    }

    @Override
    public Page<WorkflowDefinitionVO> getWorkflowDefinitions(WorkflowDefinitionQueryDTO query) {
        Page<WorkflowDefinition> page = new Page<>(query.getPageNum(), query.getPageSize());
        
        LambdaQueryWrapper<WorkflowDefinition> wrapper = new LambdaQueryWrapper<>();
        
        // 条件查询
        if (query.getWorkflowName() != null && !query.getWorkflowName().trim().isEmpty()) {
            wrapper.like(WorkflowDefinition::getWorkflowName, query.getWorkflowName().trim());
        }
        
        if (query.getCategory() != null && !query.getCategory().trim().isEmpty()) {
            wrapper.eq(WorkflowDefinition::getCategory, query.getCategory().trim());
        }
        
        if (query.getStatus() != null) {
            wrapper.eq(WorkflowDefinition::getStatus, query.getStatus());
        }
        
        // 排序：按创建时间倒序，再按排序序号升序
        wrapper.orderByDesc(WorkflowDefinition::getCreateTime)
               .orderByAsc(WorkflowDefinition::getSortOrder);
        
        Page<WorkflowDefinition> definitionPage = workflowDefinitionMapper.selectPage(page, wrapper);
        
        // 转换为VO
        Page<WorkflowDefinitionVO> voPage = new Page<>();
        voPage.setCurrent(definitionPage.getCurrent());
        voPage.setSize(definitionPage.getSize());
        voPage.setTotal(definitionPage.getTotal());
        
        List<WorkflowDefinitionVO> voList = definitionPage.getRecords().stream()
            .map(this::convertToWorkflowDefinitionVO)
            .collect(Collectors.toList());
        voPage.setRecords(voList);
        
        return voPage;
    }
    
    // ========== 私有方法 ==========
    
    private void validateWorkflowConfig(Long workflowId) {
        // 验证是否有开始节点和结束节点
        List<WorkflowNode> nodes = workflowNodeMapper.selectList(
            new LambdaQueryWrapper<WorkflowNode>()
                .eq(WorkflowNode::getWorkflowId, workflowId)
        );
        
        if (nodes.isEmpty()) {
            throw new RuntimeException("工作流未配置节点");
        }
        
        boolean hasStart = nodes.stream().anyMatch(n -> NodeType.START.name().equals(n.getNodeType()));
        boolean hasEnd = nodes.stream().anyMatch(n -> NodeType.END.name().equals(n.getNodeType()));
        
        if (!hasStart || !hasEnd) {
            throw new RuntimeException("工作流必须包含开始节点和结束节点");
        }
    }
    
    private String generateInstanceNo() {
        return "WF" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8);
    }
    
    private TaskVO convertToTaskVO(WorkflowTask task) {
        TaskVO vo = new TaskVO();
        vo.setId(task.getId());
        vo.setInstanceId(task.getInstanceId());
        vo.setInstanceNo(task.getInstanceNo());
        vo.setNodeName(task.getNodeName());
        vo.setStatus(task.getStatus());
        vo.setCreateTime(task.getCreateTime());
        vo.setPriority(task.getPriority());
        
        // 获取流程实例信息
        WorkflowInstance instance = workflowInstanceMapper.selectById(task.getInstanceId());
        if (instance != null) {
            vo.setWorkflowName(instance.getWorkflowName());
            vo.setTitle(instance.getTitle());
            vo.setStartUserName(instance.getStartUserName());
        }
        
        return vo;
    }
    
    private InstanceVO convertToInstanceVO(WorkflowInstance instance) {
        InstanceVO vo = new InstanceVO();
        vo.setId(instance.getId());
        vo.setInstanceNo(instance.getInstanceNo());
        vo.setWorkflowName(instance.getWorkflowName());
        vo.setStatus(instance.getStatus());
        vo.setTitle(instance.getTitle());
        vo.setStartTime(instance.getStartTime());
        vo.setEndTime(instance.getEndTime());
        vo.setPriority(instance.getPriority());
        return vo;
    }
    
    private HistoryVO convertToHistoryVO(WorkflowHistory history) {
        HistoryVO vo = new HistoryVO();
        vo.setId(history.getId());
        vo.setNodeName(history.getNodeName());
        vo.setAction(history.getAction());
        vo.setOperatorName(history.getOperatorName());
        vo.setComment(history.getComment());
        vo.setOperateTime(history.getOperateTime());
        vo.setDuration(history.getDuration());
        return vo;
    }

    private WorkflowDefinitionVO convertToWorkflowDefinitionVO(WorkflowDefinition definition) {
        WorkflowDefinitionVO vo = new WorkflowDefinitionVO();
        vo.setId(definition.getId());
        vo.setWorkflowKey(definition.getWorkflowKey());
        vo.setWorkflowName(definition.getWorkflowName());
        vo.setWorkflowDesc(definition.getWorkflowDesc());
        vo.setCategory(definition.getCategory());
        vo.setVersion(definition.getVersion());
        vo.setStatus(definition.getStatus());
        vo.setFormId(definition.getFormId());
        vo.setIcon(definition.getIcon());
        vo.setSortOrder(definition.getSortOrder());
        vo.setCreateBy(definition.getCreateBy());
        vo.setCreateTime(definition.getCreateTime());
        vo.setUpdateBy(definition.getUpdateBy());
        vo.setUpdateTime(definition.getUpdateTime());
        return vo;
    }
}
