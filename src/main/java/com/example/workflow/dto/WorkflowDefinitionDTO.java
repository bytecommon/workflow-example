package com.example.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工作流定义DTO
 */
@Data
public class WorkflowDefinitionDTO {

    /**
     * 工作流唯一标识，用于区分不同的工作流
     * 例如：leave_approval, purchase_approval
     */
    @NotBlank(message = "工作流标识不能为空")
    private String workflowKey;

    /**
     * 工作流显示名称
     * 例如：请假审批、采购审批
     */
    @NotBlank(message = "工作流名称不能为空")
    private String workflowName;

    /**
     * 工作流描述信息
     */
    private String workflowDesc;

    /**
     * 工作流分类
     * 例如：人事管理、财务管理、行政管理
     */
    private String category;

    /**
     * 关联的模板ID
     */
    private Long templateId;

    /**
     * 关联的表单ID
     */
    private Long formId;

    /**
     * 工作流图标
     */
    private String icon;
}
