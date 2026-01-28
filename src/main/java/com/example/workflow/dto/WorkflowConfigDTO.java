package com.example.workflow.dto;

import com.example.workflow.entity.WorkflowApprover;
import com.example.workflow.entity.WorkflowEdge;
import com.example.workflow.entity.WorkflowNode;
import lombok.Data;

/**
 * 工作流配置DTO
 */
@Data
public class WorkflowConfigDTO {

    /**
     * 工作流节点列表
     * 包含开始节点、审批节点、抄送节点、条件节点、结束节点
     */
    private java.util.List<WorkflowNode> nodes;

    /**
     * 工作流连线列表
     * 定义节点之间的流转关系
     */
    private java.util.List<WorkflowEdge> edges;

    /**
     * 审批人配置列表
     * 定义每个节点的审批人和审批模式
     */
    private java.util.List<WorkflowApprover> approvers;
}
