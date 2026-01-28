package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工作流历史实体
 * 用于记录流程实例的所有操作历史，包括审批、转交、撤销等
 */
@Data
@TableName("workflow_history")
public class WorkflowHistory {

    /**
     * 历史记录ID
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
     * 任务ID
     * 关联到workflow_task表的id字段，如果是流程操作则为空
     */
    private Long taskId;

    /**
     * 节点ID
     * 操作发生的节点ID
     */
    private Long nodeId;

    /**
     * 节点名称
     * 操作发生的节点名称
     */
    private String nodeName;

    /**
     * 操作动作
     * START-发起流程，APPROVE-同意，REJECT-拒绝，TRANSFER-转交，CANCEL-撤销
     */
    private String action;

    /**
     * 操作人ID
     * 执行操作的用户ID
     */
    private String operatorId;

    /**
     * 操作人姓名
     * 执行操作的用户姓名
     */
    private String operatorName;

    /**
     * 操作意见/评论
     * 审批意见或操作说明
     */
    private String comment;

    /**
     * 附件信息
     * JSON格式，存储审批时上传的附件信息
     */
    private String attachments;

    /**
     * 处理耗时
     * 从任务创建到完成的耗时（毫秒）
     */
    private Long duration;

    /**
     * 操作时间
     * 操作执行的时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime operateTime;
}