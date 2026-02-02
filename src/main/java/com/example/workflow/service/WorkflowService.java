package com.example.workflow.service;

import com.example.workflow.dto.*;
import com.example.workflow.vo.*;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import java.util.List;

/**
 * 工作流服务接口
 */
public interface WorkflowService {
    
    /**
     * 创建工作流定义
     */
    Long createWorkflowDefinition(WorkflowDefinitionDTO dto);
    
    /**
     * 更新工作流定义
     */
    void updateWorkflowDefinition(Long id, WorkflowDefinitionDTO dto);
    
    /**
     * 删除工作流定义
     */
    void deleteWorkflowDefinition(Long id);
    
    /**
     * 发布工作流（启用）
     */
    void publishWorkflow(Long id);
    
    /**
     * 获取工作流详情（包含节点和连线）
     */
    WorkflowDetailVO getWorkflowDetail(Long id);
    
    /**
     * 保存工作流配置（节点、连线、审批人）
     */
    void saveWorkflowConfig(Long workflowId, WorkflowConfigDTO config);

    /**
     * 获取工作流配置（表单配置和审批规则）
     */
    WorkflowConfigDTO getWorkflowConfig(Long workflowId);

    /**
     * 启动工作流
     */
    Long startWorkflow(WorkflowStartDTO dto);
    
    /**
     * 审批任务
     */
    void approveTask(Long taskId, TaskApproveDTO dto);
    
    /**
     * 转交任务
     */
    void transferTask(Long taskId, TaskTransferDTO dto);
    
    /**
     * 撤销流程
     */
    void cancelInstance(Long instanceId, String reason);
    
    /**
     * 获取我的待办任务
     */
    Page<TaskVO> getMyPendingTasks(TaskQueryDTO query);
    
    /**
     * 获取我发起的流程
     */
    Page<InstanceVO> getMyInstances(InstanceQueryDTO query);
    
    /**
     * 获取流程实例详情（完整信息）
     */
    InstanceDetailVO getInstanceDetail(Long instanceId);

    /**
     * 获取流程实例基本信息
     */
    InstanceInfoVO getInstanceInfo(Long instanceId);

    /**
     * 获取流程实例表单数据
     */
    InstanceFormDataVO getInstanceFormData(Long instanceId);

    /**
     * 获取流程实例流程图
     */
    InstanceGraphVO getInstanceGraph(Long instanceId);

    /**
     * 获取流程实例任务列表
     */
    List<TaskVO> getInstanceTasks(Long instanceId);

    /**
     * 获取流程审批历史
     */
    List<HistoryVO> getInstanceHistory(Long instanceId);

    /**
     * 获取流程定义列表
     */
    Page<WorkflowDefinitionVO> getWorkflowDefinitions(WorkflowDefinitionQueryDTO query);
}
