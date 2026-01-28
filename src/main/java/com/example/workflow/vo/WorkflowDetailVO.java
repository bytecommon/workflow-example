package com.example.workflow.vo;

import com.example.workflow.entity.WorkflowApprover;
import com.example.workflow.entity.WorkflowEdge;
import com.example.workflow.entity.WorkflowNode;
import lombok.Data;

import java.util.List;

/**
 * 工作流详情VO
 */
@Data
public class WorkflowDetailVO {

    /**
     * 工作流ID
     */
    private Long id;

    /**
     * 工作流唯一标识
     */
    private String workflowKey;

    /**
     * 工作流名称
     */
    private String workflowName;

    /**
     * 工作流描述
     */
    private String workflowDesc;

    /**
     * 分类
     */
    private String category;

    /**
     * 关联表单ID
     */
    private Long formId;

    /**
     * 状态：0-停用，1-启用
     */
    private Integer status;

    /**
     * 节点列表
     */
    private List<WorkflowNode> nodes;

    /**
     * 连线列表
     */
    private List<WorkflowEdge> edges;

    /**
     * 审批人配置列表
     */
    private List<WorkflowApprover> approvers;
}
