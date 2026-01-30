package com.example.workflow.vo;

import com.example.workflow.entity.WorkflowNode;
import com.example.workflow.entity.WorkflowEdge;
import lombok.Data;

import java.util.List;

/**
 * 流程实例流程图VO
 */
@Data
public class InstanceGraphVO {

    /**
     * 流程实例ID
     */
    private Long instanceId;

    /**
     * 流程实例编号
     */
    private String instanceNo;

    /**
     * 工作流名称
     */
    private String workflowName;

    /**
     * 流程状态
     */
    private String status;

    /**
     * 节点列表
     */
    private List<WorkflowNode> nodes;

    /**
     * 连线列表
     */
    private List<WorkflowEdge> edges;

    /**
     * 当前节点ID
     */
    private Long currentNodeId;

    /**
     * 已完成节点ID列表
     */
    private List<Long> completedNodeIds;
}
