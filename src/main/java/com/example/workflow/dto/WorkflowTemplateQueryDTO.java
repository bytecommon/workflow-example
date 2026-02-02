package com.example.workflow.dto;

import lombok.Data;

/**
 * 流程模板查询DTO
 */
@Data
public class WorkflowTemplateQueryDTO {

    /**
     * 页码
     */
    private Integer pageNum = 1;

    /**
     * 每页大小
     */
    private Integer pageSize = 10;

    /**
     * 模板名称（模糊查询）
     */
    private String templateName;

    /**
     * 模板分类
     */
    private String category;

    /**
     * 状态
     */
    private Integer status;
}
