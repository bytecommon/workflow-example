package com.example.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


/**
 * 表单DTO
 */
@Data
public class WorkflowFormDTO {
    
    /**
     * 表单唯一标识
     * 例如：leave_form, purchase_form
     */
    @NotBlank(message = "表单标识不能为空")
    private String formKey;
    
    /**
     * 表单显示名称
     * 例如：请假申请表、采购申请表
     */
    @NotBlank(message = "表单名称不能为空")
    private String formName;
    
    /**
     * 表单描述信息
     */
    private String formDesc;
    
    /**
     * 表单配置（JSON格式）
     * 定义表单的字段、类型、校验规则等
     * 例如：{"fields":[{"name":"leaveType","label":"请假类型","type":"select","required":true}]}
     */
    @NotBlank(message = "表单配置不能为空")
    private String formConfig;
}
