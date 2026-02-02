package com.example.workflow.dto;

import com.example.workflow.entity.WorkflowTemplateNode;
import com.example.workflow.entity.WorkflowTemplateEdge;
import lombok.Data;

import java.util.List;

/**
 * 流程模板配置DTO
 */
@Data
public class WorkflowTemplateConfigDTO {

    /**
     * 模板节点列表
     * 包含开始节点、审批节点、抄送节点、条件节点、结束节点
     */
    private List<WorkflowTemplateNode> nodes;

    /**
     * 模板连线列表
     * 定义节点之间的流转关系
     */
    private List<WorkflowTemplateEdge> edges;
}
