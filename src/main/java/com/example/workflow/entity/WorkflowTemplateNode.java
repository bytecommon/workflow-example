package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 流程模板节点实体
 * 用于定义流程模板中的节点信息
 */
@Data
@TableName("workflow_template_node")
public class WorkflowTemplateNode {

    /**
     * 节点ID
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
     * 节点唯一标识
     * 用于区分模板中的不同节点
     */
    private String nodeKey;

    /**
     * 节点名称
     * 节点的显示名称，如：开始、部门经理审批、结束
     */
    private String nodeName;

    /**
     * 节点类型
     * START-开始，APPROVE-审批，CC-抄送，CONDITION-条件，END-结束
     */
    private String nodeType;

    /**
     * X坐标
     * 节点在流程图中的X坐标
     */
    private Integer positionX;

    /**
     * Y坐标
     * 节点在流程图中的Y坐标
     */
    private Integer positionY;

    /**
     * 节点配置
     * 节点的详细配置，JSON格式
     */
    private String config;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}
