package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 工作流实例实体
 * 用于记录工作流的具体执行实例，每个流程启动都会创建一个实例
 */
@Data
@TableName("workflow_instance")
public class WorkflowInstance {
    
    /**
     * 实例ID
     * 主键，自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 实例编号
     * 流程实例的唯一标识，格式：WF+年月日+流水号
     */
    private String instanceNo;
    
    /**
     * 工作流ID
     * 关联到workflow_definition表的id字段
     */
    private Long workflowId;
    
    /**
     * 工作流Key
     * 工作流的唯一标识
     */
    private String workflowKey;
    
    /**
     * 工作流名称
     * 发起流程时的工作流名称
     */
    private String workflowName;
    
    /**
     * 表单ID
     * 关联到workflow_form表的id字段
     */
    private Long formId;
    
    /**
     * 表单数据
     * JSON格式，存储流程表单填写的数据
     */
    private String formData;
    
    /**
     * 流程状态
     * RUNNING-运行中，APPROVED-已通过，REJECTED-已拒绝，CANCELED-已取消，TERMINATED-已终止
     */
    private String status;
    
    /**
     * 当前节点ID
     * 流程当前所在的节点ID
     */
    private Long currentNodeId;
    
    /**
     * 发起人用户ID
     * 发起流程的用户ID
     */
    private String startUserId;
    
    /**
     * 发起人用户姓名
     * 发起流程的用户姓名
     */
    private String startUserName;
    
    /**
     * 发起时间
     * 流程实例的创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime startTime;
    
    /**
     * 结束时间
     * 流程实例的完成时间
     */
    private LocalDateTime endTime;
    
    /**
     * 处理耗时
     * 从流程发起到完成的总耗时（毫秒）
     */
    private Long duration;
    
    /**
     * 业务键
     * 用于关联外部业务系统的唯一标识
     */
    private String businessKey;
    
    /**
     * 流程标题
     * 流程的标题，用于显示和搜索
     */
    private String title;
    
    /**
     * 优先级
     * 0-普通，1-紧急，2-特急
     */
    private Integer priority;
    
    /**
     * 删除标记
     * 逻辑删除标记，0-未删除，1-已删除
     */
    @TableLogic
    private Integer deleted;
}
