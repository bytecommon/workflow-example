package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 审批人配置实体
 * 用于配置工作流节点的审批人信息，包括审批人类型、审批方式等
 */
@Data
@TableName("workflow_approver")
public class WorkflowApprover {

    /**
     * 审批人配置ID
     * 主键，自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 节点ID
     * 关联到workflow_node表的id字段
     */
    private Long nodeId;

    /**
     * 审批人类型
     * 例如：USER-指定用户，ROLE-指定角色，DEPT-指定部门，LEADER-部门领导
     */
    private String approverType;

    /**
     * 审批人值
     * 根据approverType存储对应的值，如用户ID、角色ID等
     */
    private String approverValue;

    /**
     * 审批方式
     * AND-会签（需要所有人审批），OR-或签（一人审批即可），SEQUENTIAL-顺序审批
     */
    private String approveMode;

    /**
     * 无人审批处理方式
     * AUTO_PASS-自动通过，AUTO_REJECT-自动拒绝，ADMIN-转交管理员
     */
    private String nobodyHandler;

    /**
     * 创建时间
     * 自动填充，记录审批人配置的创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}