package com.example.workflow.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 流程实例基本信息VO
 */
@Data
public class InstanceInfoVO {

    /**
     * 流程实例ID
     */
    private Long id;

    /**
     * 流程实例编号
     */
    private String instanceNo;

    /**
     * 工作流ID
     */
    private Long definitionId;

    /**
     * 工作流名称
     */
    private String workflowName;

    /**
     * 流程状态
     * RUNNING-运行中，APPROVED-已通过，REJECTED-已拒绝，CANCELED-已取消，TERMINATED-已终止
     */
    private String status;

    /**
     * 流程标题
     */
    private String title;

    /**
     * 发起人用户ID
     */
    private String startUserId;

    /**
     * 发起人姓名
     */
    private String startUserName;

    /**
     * 发起时间
     */
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    private LocalDateTime endTime;

    /**
     * 优先级：0-普通，1-紧急，2-特急
     */
    private Integer priority;

    /**
     * 当前节点名称
     */
    private String currentNodeName;
}
