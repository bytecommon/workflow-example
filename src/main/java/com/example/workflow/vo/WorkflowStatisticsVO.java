package com.example.workflow.vo;

import lombok.Data;

/**
 * 工作流统计VO
 */
@Data
public class WorkflowStatisticsVO {
    
    // ========== 用户维度统计 ==========
    
    /**
     * 待办任务数
     * 用户当前需要处理的任务数量
     */
    private Long pendingTaskCount;
    
    /**
     * 已完成任务数
     * 用户已处理（同意或拒绝）的任务数量
     */
    private Long completedTaskCount;
    
    /**
     * 发起的流程数
     * 用户作为发起人的流程总数
     */
    private Long startedInstanceCount;
    
    // ========== 工作流维度统计 ==========
    
    /**
     * 总流程数
     * 该工作流的所有流程实例数量
     */
    private Long totalInstanceCount;
    
    /**
     * 运行中的流程数
     * 该工作流当前正在运行的流程数量
     */
    private Long runningInstanceCount;
    
    /**
     * 已通过的流程数
     * 该工作流已审批通过的流程数量
     */
    private Long approvedInstanceCount;
    
    /**
     * 已拒绝的流程数
     * 该工作流已被拒绝的流程数量
     */
    private Long rejectedInstanceCount;
}
