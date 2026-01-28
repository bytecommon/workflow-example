package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 工作流任务实体
 * 用于记录流程实例中的待办任务，包括审批任务、抄送任务等
 */
@Data
@TableName("workflow_task")
public class WorkflowTask {
    
    /**
     * 任务ID
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
     * 流程实例的唯一标识
     */
    private String instanceNo;
    
    /**
     * 节点ID
     * 关联到workflow_node表的id字段
     */
    private Long nodeId;
    
    /**
     * 节点Key
     * 节点的唯一标识
     */
    private String nodeKey;
    
    /**
     * 节点名称
     * 节点的显示名称
     */
    private String nodeName;
    
    /**
     * 节点类型
     * 节点的类型，如APPROVE、CC等
     */
    private String nodeType;
    
    /**
     * 办理人ID
     * 任务的处理人用户ID
     */
    private String assigneeId;
    
    /**
     * 办理人姓名
     * 任务的处理人用户姓名
     */
    private String assigneeName;
    
    /**
     * 任务状态
     * PENDING-待处理，APPROVED-已同意，REJECTED-已拒绝，TRANSFERRED-已转交，CANCELED-已取消
     */
    private String status;
    
    /**
     * 审批意见
     * 处理人填写的审批意见或评论
     */
    private String comment;
    
    /**
     * 附件信息
     * JSON格式，存储审批时上传的附件信息
     */
    private String attachments;
    
    /**
     * 任务创建时间
     * 任务的生成时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    /**
     * 任务认领时间
     * 处理人领取任务的时间
     */
    private LocalDateTime claimTime;
    
    /**
     * 任务完成时间
     * 任务处理完成的时间
     */
    private LocalDateTime completeTime;
    
    /**
     * 任务截止时间
     * 任务的最晚处理时间
     */
    private LocalDateTime dueTime;
    
    /**
     * 任务优先级
     * 0-普通，1-紧急，2-特急
     */
    private Integer priority;
}
