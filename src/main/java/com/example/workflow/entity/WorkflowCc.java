package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工作流抄送实体
 * 用于记录流程抄送信息，包括抄送人、抄送节点、阅读状态等
 */
@Data
@TableName("workflow_cc")
public class WorkflowCc {

    /**
     * 抄送记录ID
     * 主键，自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 流程实例ID
     * 关联到workflow_instance表的id字段
     */
    private Long instanceId;

    /**
     * 流程实例编号
     * 流程的唯一标识编号
     */
    private String instanceNo;

    /**
     * 节点ID
     * 抄送发生的节点ID
     */
    private Long nodeId;

    /**
     * 节点名称
     * 抄送发生的节点名称
     */
    private String nodeName;

    /**
     * 抄送用户ID
     * 被抄送的用户ID
     */
    private String ccUserId;

    /**
     * 抄送用户姓名
     * 被抄送的用户姓名
     */
    private String ccUserName;

    /**
     * 抄送状态
     * 0-未读，1-已读
     */
    private Integer status;

    /**
     * 阅读时间
     * 抄送内容的实际阅读时间
     */
    private LocalDateTime readTime;

    /**
     * 创建时间
     * 抄送记录的创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}