package com.example.workflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.workflow.dto.enums.*;
import com.example.workflow.entity.*;
import com.example.workflow.mapper.*;
import com.example.workflow.service.WorkflowEngineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 工作流引擎服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowEngineServiceImpl implements WorkflowEngineService {
    
    private final WorkflowNodeMapper workflowNodeMapper;
    private final WorkflowEdgeMapper workflowEdgeMapper;
    private final WorkflowApproverMapper workflowApproverMapper;
    private final WorkflowInstanceMapper workflowInstanceMapper;
    private final WorkflowTaskMapper workflowTaskMapper;
    private final WorkflowCcMapper workflowCcMapper;
    private final SysUserMapper sysUserMapper;
    private final SysRoleMapper sysRoleMapper;
    private final SysDeptMapper sysDeptMapper;
    private final SysUserRoleMapper sysUserRoleMapper;
    
    /**
     * 系统管理员用户ID（用于处理无审批人转交管理员的情况）
     */
    private static final String SYSTEM_ADMIN_ID = "admin";
    private static final String SYSTEM_ADMIN_NAME = "系统管理员";
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startProcess(Long instanceId) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new RuntimeException("流程实例不存在");
        }
        
        // 查找开始节点
        WorkflowNode startNode = workflowNodeMapper.selectOne(
            new LambdaQueryWrapper<WorkflowNode>()
                .eq(WorkflowNode::getWorkflowId, instance.getWorkflowId())
                .eq(WorkflowNode::getNodeType, NodeType.START.name())
        );
        
        if (startNode == null) {
            throw new RuntimeException("未找到开始节点");
        }
        
        // 查找开始节点的下一个节点
        Long nextNodeId = calculateNextNode(startNode.getId(), instanceId, true);
        
        if (nextNodeId == null) {
            throw new RuntimeException("流程配置错误：开始节点没有后续节点");
        }
        
        // 更新实例当前节点
        instance.setCurrentNodeId(nextNodeId);
        workflowInstanceMapper.updateById(instance);
        
        // 创建任务
        createTasks(instanceId, nextNodeId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void processTask(Long instanceId, Long taskId, boolean approved) {
        WorkflowTask task = workflowTaskMapper.selectById(taskId);
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        
        if (task == null || instance == null) {
            throw new RuntimeException("任务或流程实例不存在");
        }
        
        // 如果是拒绝，直接结束流程
        if (!approved) {
            instance.setStatus(InstanceStatus.REJECTED.name());
            instance.setEndTime(LocalDateTime.now());
            instance.setDuration(
                java.time.Duration.between(instance.getStartTime(), LocalDateTime.now()).toMillis()
            );
            workflowInstanceMapper.updateById(instance);
            
            // 取消其他待办任务
            cancelPendingTasks(instanceId);
            return;
        }
        
        // 检查当前节点的所有任务是否都已完成
        Long currentNodeId = task.getNodeId();
        List<WorkflowTask> nodeTasks = workflowTaskMapper.selectList(
            new LambdaQueryWrapper<WorkflowTask>()
                .eq(WorkflowTask::getInstanceId, instanceId)
                .eq(WorkflowTask::getNodeId, currentNodeId)
        );
        
        // 获取审批模式
        WorkflowApprover approver = workflowApproverMapper.selectOne(
            new LambdaQueryWrapper<WorkflowApprover>()
                .eq(WorkflowApprover::getNodeId, currentNodeId)
                .last("LIMIT 1")
        );
        
        String approveMode = approver != null ? approver.getApproveMode() : ApproveMode.OR.name();
        
        // 判断是否可以流转到下一节点
        boolean canMoveNext = false;
        
        if (ApproveMode.OR.name().equals(approveMode)) {
            // 或签：任意一人同意即可
            canMoveNext = true;
        } else if (ApproveMode.AND.name().equals(approveMode)) {
            // 会签：所有人都要同意
            long approvedCount = nodeTasks.stream()
                .filter(t -> TaskStatus.APPROVED.name().equals(t.getStatus()))
                .count();
            canMoveNext = approvedCount == nodeTasks.size();
        } else if (ApproveMode.SEQUENCE.name().equals(approveMode)) {
            // 依次审批：当前审批通过即可
            canMoveNext = true;
        }
        
        if (!canMoveNext) {
            log.info("节点 {} 还有未完成的任务，等待其他审批人", currentNodeId);
            return;
        }
        
        // 如果是或签，取消其他待办任务
        if (ApproveMode.OR.name().equals(approveMode)) {
            nodeTasks.stream()
                .filter(t -> TaskStatus.PENDING.name().equals(t.getStatus()) && !t.getId().equals(taskId))
                .forEach(t -> {
                    t.setStatus(TaskStatus.CANCELED.name());
                    workflowTaskMapper.updateById(t);
                });
        }
        
        // 计算下一个节点
        Long nextNodeId = calculateNextNode(currentNodeId, instanceId, true);
        
        if (nextNodeId == null) {
            // 没有下一个节点，流程结束
            instance.setStatus(InstanceStatus.APPROVED.name());
            instance.setEndTime(LocalDateTime.now());
            instance.setDuration(
                java.time.Duration.between(instance.getStartTime(), LocalDateTime.now()).toMillis()
            );
            workflowInstanceMapper.updateById(instance);
            log.info("流程 {} 已结束", instanceId);
            return;
        }
        
        // 更新实例当前节点
        instance.setCurrentNodeId(nextNodeId);
        workflowInstanceMapper.updateById(instance);
        
        // 创建下一个节点的任务
        createTasks(instanceId, nextNodeId);
    }
    
    @Override
    public Long calculateNextNode(Long currentNodeId, Long instanceId, boolean approved) {
        // 查找当前节点的所有出边
        List<WorkflowEdge> edges = workflowEdgeMapper.selectList(
            new LambdaQueryWrapper<WorkflowEdge>()
                .eq(WorkflowEdge::getSourceNodeId, currentNodeId)
                .orderByAsc(WorkflowEdge::getPriority)
        );
        
        if (edges.isEmpty()) {
            return null;
        }
        
        // 如果只有一条边，直接返回
        if (edges.size() == 1) {
            WorkflowEdge edge = edges.get(0);
            WorkflowNode targetNode = workflowNodeMapper.selectById(edge.getTargetNodeId());
            
            // 如果是结束节点，返回null
            if (targetNode != null && NodeType.END.name().equals(targetNode.getNodeType())) {
                return null;
            }
            
            return edge.getTargetNodeId();
        }
        
        // 多条边，需要根据条件表达式判断
        for (WorkflowEdge edge : edges) {
            if (StringUtils.hasText(edge.getConditionExpr())) {
                // 这里应该实现条件表达式的计算
                // 简化处理：如果条件为空或者approved为true，则选择该边
                boolean conditionMet = evaluateCondition(edge.getConditionExpr(), instanceId);
                if (conditionMet) {
                    WorkflowNode targetNode = workflowNodeMapper.selectById(edge.getTargetNodeId());
                    if (targetNode != null && NodeType.END.name().equals(targetNode.getNodeType())) {
                        return null;
                    }
                    return edge.getTargetNodeId();
                }
            } else {
                // 没有条件的边作为默认路径
                WorkflowNode targetNode = workflowNodeMapper.selectById(edge.getTargetNodeId());
                if (targetNode != null && NodeType.END.name().equals(targetNode.getNodeType())) {
                    return null;
                }
                return edge.getTargetNodeId();
            }
        }
        
        return null;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createTasks(Long instanceId, Long nodeId) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        WorkflowNode node = workflowNodeMapper.selectById(nodeId);
        
        if (instance == null || node == null) {
            throw new RuntimeException("流程实例或节点不存在");
        }
        
        // 如果是结束节点，不创建任务
        if (NodeType.END.name().equals(node.getNodeType())) {
            return;
        }
        
        // 如果是抄送节点，创建抄送记录
        if (NodeType.CC.name().equals(node.getNodeType())) {
            createCcRecords(instanceId, nodeId);
            // 抄送节点不阻塞流程，继续流转
            processTask(instanceId, null, true);
            return;
        }
        
        // 如果是条件节点，直接流转
        if (NodeType.CONDITION.name().equals(node.getNodeType())) {
            processTask(instanceId, null, true);
            return;
        }
        
        // 获取审批人配置
        List<WorkflowApprover> approvers = workflowApproverMapper.selectList(
            new LambdaQueryWrapper<WorkflowApprover>()
                .eq(WorkflowApprover::getNodeId, nodeId)
        );
        
        if (approvers.isEmpty()) {
            throw new RuntimeException("节点 " + node.getNodeName() + " 未配置审批人");
        }
        
        // 根据审批人配置创建任务
        for (WorkflowApprover approver : approvers) {
            List<String[]> assignees = resolveApprovers(approver, instance);
            
            if (assignees.isEmpty()) {
                // 无审批人的处理
                handleNobodyApprover(approver, instance, nodeId);
                continue;
            }
            
            for (String[] assignee : assignees) {
                WorkflowTask task = new WorkflowTask();
                task.setInstanceId(instanceId);
                task.setInstanceNo(instance.getInstanceNo());
                task.setNodeId(nodeId);
                task.setNodeKey(node.getNodeKey());
                task.setNodeName(node.getNodeName());
                task.setNodeType(node.getNodeType());
                task.setAssigneeId(assignee[0]);
                task.setAssigneeName(assignee[1]);
                task.setStatus(TaskStatus.PENDING.name());
                task.setPriority(instance.getPriority());
                
                workflowTaskMapper.insert(task);
                log.info("创建任务：instanceId={}, nodeId={}, assignee={}", instanceId, nodeId, assignee[1]);
            }
        }
    }
    
    // ========== 私有方法 ==========
    
    /**
     * 解析审批人
     */
    private List<String[]> resolveApprovers(WorkflowApprover approver, WorkflowInstance instance) {
        List<String[]> result = new ArrayList<>();
        String approverType = approver.getApproverType();
        String approverValue = approver.getApproverValue();
        
        if (ApproverType.USER.name().equals(approverType)) {
            // 指定用户：approverValue格式为 "userId1:userName1,userId2:userName2"
            if (StringUtils.hasText(approverValue)) {
                String[] users = approverValue.split(",");
                for (String user : users) {
                    String[] parts = user.split(":");
                    if (parts.length == 2) {
                        result.add(new String[]{parts[0], parts[1]});
                    }
                }
            }
        } else if (ApproverType.ROLE.name().equals(approverType)) {
            // 角色：查询拥有该角色的所有用户（通过用户角色关联表）
            if (StringUtils.hasText(approverValue)) {
                List<Integer> userIds = sysUserRoleMapper.selectUserIdsByRoleCode(approverValue);
                for (Integer userId : userIds) {
                    SysUser user = sysUserMapper.selectById(userId);
                    if (user != null) {
                        result.add(new String[]{user.getId().toString(), user.getRealName()}); // 使用realName而不是name
                    }
                }
                log.info("角色 {} 解析到 {} 个用户", approverValue, userIds.size());
            }
        } else if (ApproverType.DEPT.name().equals(approverType)) {
            // 部门：查询该部门下的所有用户（通过部门ID）
            if (StringUtils.hasText(approverValue)) {
                try {
                    Long deptId = Long.parseLong(approverValue);
                    List<SysUser> deptUsers = sysUserMapper.selectByDeptId(deptId);
                    for (SysUser user : deptUsers) {
                        result.add(new String[]{user.getId().toString(), user.getRealName()}); // 使用realName而不是name
                    }
                    log.info("部门 {} 解析到 {} 个用户", approverValue, deptUsers.size());
                } catch (NumberFormatException e) {
                    log.error("部门ID格式错误: {}", approverValue, e);
                }
            }
        } else if (ApproverType.LEADER.name().equals(approverType)) {
            // 上级领导：查询发起人的部门领导
            String leader = findLeader(instance.getStartUserId());
            if (leader != null) {
                String[] parts = leader.split(":");
                if (parts.length == 2) {
                    result.add(new String[]{parts[0], parts[1]});
                }
            } else {
                log.warn("未找到用户 {} 的上级领导", instance.getStartUserId());
            }
        } else if (ApproverType.SELF.name().equals(approverType)) {
            // 发起人自己（注意：startUserId是String类型，需要转换为Integer）
            try {
                Integer starterId = Integer.parseInt(instance.getStartUserId());
                SysUser starter = sysUserMapper.selectById(starterId);
                if (starter != null) {
                    result.add(new String[]{starter.getId().toString(), starter.getRealName()}); // 使用realName而不是name
                } else {
                    // 如果找不到用户，使用原始值
                    result.add(new String[]{instance.getStartUserId(), instance.getStartUserName()});
                }
            } catch (NumberFormatException e) {
                log.error("发起人ID格式错误: {}", instance.getStartUserId(), e);
                result.add(new String[]{instance.getStartUserId(), instance.getStartUserName()});
            }
        } else if (ApproverType.FORM_USER.name().equals(approverType)) {
            // 表单字段用户：从实例表单数据中解析用户ID和姓名
            if (StringUtils.hasText(approverValue) && instance.getFormData() != null) {
                try {
                    // 假设表单数据是JSON格式，包含用户ID和姓名字段
                    // approverValue格式如: "formField.userId,formField.userName"
                    String[] fieldPaths = approverValue.split(",");
                    if (fieldPaths.length >= 2) {
                        String userIdField = fieldPaths[0].trim();
                        String userNameField = fieldPaths[1].trim();
                        
                        // 这里简化处理，实际应该使用JSON解析库
                        String userId = extractFieldFromJson(instance.getFormData(), userIdField);
                        String userName = extractFieldFromJson(instance.getFormData(), userNameField);
                        
                        if (StringUtils.hasText(userId) && StringUtils.hasText(userName)) {
                            result.add(new String[]{userId, userName});
                        }
                    }
                } catch (Exception e) {
                    log.error("解析表单字段审批人失败", e);
                }
            }
        }
        
        return result;
    }
    
    /**
     * 处理无审批人的情况
     */
    private void handleNobodyApprover(WorkflowApprover approver, WorkflowInstance instance, Long nodeId) {
        String nobodyHandler = approver.getNobodyHandler();
        
        if ("AUTO_PASS".equals(nobodyHandler)) {
            // 自动通过：直接流转到下一节点
            log.info("节点 {} 无审批人，自动通过", nodeId);
            // 直接流转到下一节点
            Long nextNodeId = calculateNextNode(nodeId, instance.getId(), true);
            if (nextNodeId != null) {
                instance.setCurrentNodeId(nextNodeId);
                workflowInstanceMapper.updateById(instance);
                createTasks(instance.getId(), nextNodeId);
            } else {
                // 流程结束
                instance.setStatus(InstanceStatus.APPROVED.name());
                instance.setEndTime(LocalDateTime.now());
                instance.setDuration(
                    java.time.Duration.between(instance.getStartTime(), LocalDateTime.now()).toMillis()
                );
                workflowInstanceMapper.updateById(instance);
                log.info("流程 {} 已自动完成", instance.getId());
            }
        } else if ("ADMIN".equals(nobodyHandler)) {
            // 转交管理员：将任务分配给系统管理员
            log.info("节点 {} 无审批人，转交给系统管理员", nodeId);
            
            WorkflowTask adminTask = new WorkflowTask();
            adminTask.setInstanceId(instance.getId());
            adminTask.setInstanceNo(instance.getInstanceNo());
            adminTask.setNodeId(nodeId);
            adminTask.setNodeKey("admin_task");
            adminTask.setNodeName("系统管理员审批");
            adminTask.setNodeType(NodeType.APPROVE.name()); // 使用APPROVE而不是USER_TASK
            adminTask.setAssigneeId(SYSTEM_ADMIN_ID);
            adminTask.setAssigneeName(SYSTEM_ADMIN_NAME);
            adminTask.setStatus(TaskStatus.PENDING.name());
            adminTask.setPriority(instance.getPriority());
            
            workflowTaskMapper.insert(adminTask);
            log.info("创建管理员任务：instanceId={}, nodeId={}", instance.getId(), nodeId);
        } else {
            throw new RuntimeException("节点无审批人且未配置处理策略");
        }
    }
    
    /**
     * 创建抄送记录
     */
    private void createCcRecords(Long instanceId, Long nodeId) {
        WorkflowInstance instance = workflowInstanceMapper.selectById(instanceId);
        WorkflowNode node = workflowNodeMapper.selectById(nodeId);
        
        // 获取抄送人配置（复用审批人配置表）
        List<WorkflowApprover> approvers = workflowApproverMapper.selectList(
            new LambdaQueryWrapper<WorkflowApprover>()
                .eq(WorkflowApprover::getNodeId, nodeId)
        );
        
        for (WorkflowApprover approver : approvers) {
            List<String[]> ccUsers = resolveApprovers(approver, instance);
            
            for (String[] ccUser : ccUsers) {
                WorkflowCc cc = new WorkflowCc();
                cc.setInstanceId(instanceId);
                cc.setInstanceNo(instance.getInstanceNo());
                cc.setNodeId(nodeId);
                cc.setNodeName(node.getNodeName());
                cc.setCcUserId(ccUser[0]);
                cc.setCcUserName(ccUser[1]);
                cc.setStatus(0); // 未读
                
                workflowCcMapper.insert(cc);
                log.info("创建抄送：instanceId={}, ccUser={}", instanceId, ccUser[1]);
            }
        }
    }
    
    /**
     * 取消待办任务
     */
    private void cancelPendingTasks(Long instanceId) {
        List<WorkflowTask> tasks = workflowTaskMapper.selectList(
            new LambdaQueryWrapper<WorkflowTask>()
                .eq(WorkflowTask::getInstanceId, instanceId)
                .eq(WorkflowTask::getStatus, TaskStatus.PENDING.name())
        );
        
        for (WorkflowTask task : tasks) {
            task.setStatus(TaskStatus.CANCELED.name());
            workflowTaskMapper.updateById(task);
        }
    }
    
    /**
     * 查找用户的上级领导
     */
    private String findLeader(String userId) {
        try {
            // 查询用户信息获取部门ID
            Integer userIdInt = Integer.parseInt(userId);
            SysUser user = sysUserMapper.selectById(userIdInt);
            if (user != null && user.getDeptId() != null) {
                // 查询部门负责人（注意：部门表中的leaderId是Long类型，用户ID是Integer类型）
                Long deptId = user.getDeptId();
                SysDept dept = sysDeptMapper.selectById(deptId);
                if (dept != null && dept.getLeaderId() != null) {
                    // 由于leaderId是Long类型，需要转换为Integer
                    Long leaderIdLong = dept.getLeaderId();
                    if (leaderIdLong <= Integer.MAX_VALUE) {
                        Integer leaderId = leaderIdLong.intValue();
                    SysUser leader = sysUserMapper.selectById(leaderId);
                    if (leader != null) {
                        return leader.getId() + ":" + leader.getRealName(); // 使用realName而不是getName()
                    }
                    } else {
                        log.warn("部门负责人ID超出Integer范围: {}", leaderIdLong);
                    }
                }
            }
        } catch (NumberFormatException e) {
            log.error("用户ID格式错误: {}", userId, e);
        }
        return null;
    }
    
    /**
     * 从JSON字符串中提取字段值（简化实现）
     */
    private String extractFieldFromJson(String json, String fieldPath) {
        if (!StringUtils.hasText(json) || !StringUtils.hasText(fieldPath)) {
            return null;
        }
        
        // 这里简化处理，实际应该使用Jackson或Gson等JSON库
        // 假设fieldPath格式为 "formField.userId"，我们简单查找字段名
        try {
            String fieldName = fieldPath.substring(fieldPath.lastIndexOf('.') + 1);
            // 简单的字符串匹配，实际应用中应该使用JSON解析
            int startIndex = json.indexOf("\"" + fieldName + "\":");
            if (startIndex > 0) {
                startIndex += fieldName.length() + 3; // 跳过字段名和冒号
                int endIndex = json.indexOf(",", startIndex);
                if (endIndex == -1) {
                    endIndex = json.indexOf("}", startIndex);
                }
                if (endIndex > startIndex) {
                    String value = json.substring(startIndex, endIndex).trim();
                    // 去除引号
                    if (value.startsWith("\"") && value.endsWith("\"")) {
                        value = value.substring(1, value.length() - 1);
                    }
                    return value;
                }
            }
        } catch (Exception e) {
            log.error("提取表单字段失败: field={}, json={}", fieldPath, json, e);
        }
        return null;
    }
    
    /**
     * 条件表达式求值（简化实现）
     * TODO: 未来可实现完整的条件表达式引擎（SpEL或Aviator）
     * 当前版本：所有条件表达式都返回true（条件成立）
     */
    private boolean evaluateCondition(String expression, Long instanceId) {
        // 当前简化实现：所有条件都通过
        // 生产环境建议集成SpEL或Aviator表达式引擎
        log.debug("条件表达式求值（简化版）: {}, 结果=true", expression);
        return true;
    }
}
