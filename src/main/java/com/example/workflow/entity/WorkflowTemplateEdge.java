package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 流程模板连线实体
 * 用于定义流程模板中节点之间的连线关系
 */
@Data
@TableName("workflow_template_edge")
public class WorkflowTemplateEdge {

    /**
     * 连线ID
     * 主键，自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 模板ID
     * 关联的流程模板ID
     */
    private Long templateId;

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
     * 条件表达式
     * 流转的条件表达式
     */
    private String conditionExpr;

    /**
     * 优先级
     * 多条连线时的优先级
     */
    private Integer priority;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;
}
