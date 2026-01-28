package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工作流节点实体
 * 用于定义工作流中的各个节点，包括开始节点、审批节点、抄送节点、条件节点和结束节点
 */
@Data
@TableName("workflow_node")
public class WorkflowNode {

    /**
     * 节点ID
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
     * 节点Key
     * 节点的唯一标识，用于流程定义中识别节点
     */
    private String nodeKey;

    /**
     * 节点名称
     * 节点的显示名称
     */
    private String nodeName;

    /**
     * 节点类型
     * START-开始节点，APPROVE-审批节点，CC-抄送节点，CONDITION-条件节点，END-结束节点
     */
    private String nodeType;

    /**
     * X坐标
     * 节点在工作流设计器中的X坐标位置
     */
    private Integer positionX;

    /**
     * Y坐标
     * 节点在工作流设计器中的Y坐标位置
     */
    private Integer positionY;

    /**
     * 节点配置
     * JSON格式，存储节点的详细配置信息
     */
    private String config;

    /**
     * 创建时间
     * 节点的创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     * 节点的最后更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

}
