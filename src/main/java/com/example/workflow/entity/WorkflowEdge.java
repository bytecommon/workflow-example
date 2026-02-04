package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工作流连线实体
 * 用于定义工作流中节点之间的连接关系，包括流转条件和优先级
 */
@Data
@TableName("workflow_edge")
public class WorkflowEdge {

    /**
     * 连线ID
     * 主键，自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 工作流ID
     * 关联到workflow_definition表的id字段
     */
    private Long workflowId;

    /**
     * 源节点ID
     * 连线的起始节点ID
     */
    private Long sourceNodeId;

    /**
     * 目标节点ID
     * 连线的目标节点ID
     */
    private Long targetNodeId;

    /**
     * 源节点Key（用于前端传递，后端会自动转换为ID）
     */
    @TableField(exist = false)
    private String sourceNodeKey;

    /**
     * 目标节点Key（用于前端传递，后端会自动转换为ID）
     */
    @TableField(exist = false)
    private String targetNodeKey;

    /**
     * 条件表达式
     * 节点流转的条件，使用SPEL表达式或简单条件
     * 例如：${amount > 1000}、APPROVED
     */
    private String conditionExpr;

    /**
     * 优先级
     * 当多个条件满足时的执行优先级，数字越小优先级越高
     */
    private Integer priority;

    /**
     * 创建时间
     * 连线配置的创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}