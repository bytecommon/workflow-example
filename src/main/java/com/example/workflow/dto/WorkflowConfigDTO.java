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

    /**
     * 前端审批规则列表
     * 前端发送的审批规则，需要转换为后端的 approvers
     */
    private java.util.List<ApprovalRuleDTO> approvalRules;

    /**
     * 表单配置
     * 包含表单的基础配置和字段配置
     */
    private FormSchemaDTO formSchema;

    /**
     * 表单配置DTO
     */
    @Data
    public static class FormSchemaDTO {
        /**
         * 表单基础配置
         */
        private FormConfigDTO config;

        /**
         * 表单字段列表
         */
        private java.util.List<FormFieldDTO> fields;
    }

    /**
     * 表单基础配置DTO
     */
    @Data
    public static class FormConfigDTO {
        private String title;
        private String description;
        private String submitText;
    }

    /**
     * 表单字段DTO
     */
    @Data
    public static class FormFieldDTO {
        private String id;
        private String name;
        private String label;
        private String fieldName;
        private String type;
        private Boolean required;
        private java.util.List<String> options;
        private String placeholder;
    }

    /**
     * 前端审批规则DTO
     */
    @Data
    public static class ApprovalRuleDTO {
        private Long id;
        private String nodeId;
        private String nodeName;
        private String ruleType;  // single, multi, sequential, parallel
        private java.util.List<String> approvers;
        private Integer minApprovals;
        private Integer timeout;
        private Object conditions;
    }
}
