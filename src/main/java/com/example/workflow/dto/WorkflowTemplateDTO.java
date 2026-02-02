package com.example.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 流程模板DTO
 */
@Data
public class WorkflowTemplateDTO {

    /**
     * 模板ID（更新时需要）
     */
    private Long id;

    /**
     * 模板唯一标识
     */
    @NotBlank(message = "模板标识不能为空")
    private String templateKey;

    /**
     * 模板名称
     */
    @NotBlank(message = "模板名称不能为空")
    private String templateName;

    /**
     * 模板描述
     */
    private String templateDesc;

    /**
     * 模板分类
     */
    private String category;

    /**
     * 模板图标
     */
    private String icon;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 状态
     */
    private Integer status;
}
