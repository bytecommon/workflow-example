package com.example.workflow.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 任务VO
 */
@Data
public class TaskVO {

    /**
     * 任务ID
     */
    private Long id;

    /**
     * 流程实例ID
     */
    private Long instanceId;

    /**
     * 流程实例编号
     */
    private String instanceNo;

    /**
     * 工作流名称
     */
    private String workflowName;

    /**
     * 节点名称
     */
    private String nodeName;

    /**
     * 任务状态
     * PENDING-待处理，APPROVED-已同意，REJECTED-已拒绝，TRANSFERRED-已转交，CANCELED-已取消
     */
    private String status;

    /**
     * 流程标题
     */
    private String title;

    /**
     * 发起人姓名
     */
    private String startUserName;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 优先级：0-普通，1-紧急，2-特急
     */
    private Integer priority;
}
