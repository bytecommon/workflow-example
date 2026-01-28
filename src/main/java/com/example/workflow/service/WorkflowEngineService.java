package com.example.workflow.service;

/**
 * 工作流引擎服务
 * 负责流程的流转逻辑
 */
public interface WorkflowEngineService {
    
    /**
     * 启动流程（执行到第一个审批节点）
     */
    void startProcess(Long instanceId);
    
    /**
     * 处理任务（根据审批结果流转到下一节点）
     */
    void processTask(Long instanceId, Long taskId, boolean approved);
    
    /**
     * 计算下一个节点
     */
    Long calculateNextNode(Long currentNodeId, Long instanceId, boolean approved);
    
    /**
     * 创建任务
     */
    void createTasks(Long instanceId, Long nodeId);
}
