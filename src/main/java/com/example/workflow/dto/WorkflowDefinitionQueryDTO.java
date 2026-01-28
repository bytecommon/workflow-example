package com.example.workflow.dto;

import lombok.Data;

/**
 * 工作流定义查询DTO
 */
@Data
public class WorkflowDefinitionQueryDTO {

    /**
     * 工作流名称（模糊查询）
     */
    private String workflowName;

    /**
     * 工作流分类
     */
    private String category;

    /**
     * 状态：0-停用，1-启用
     */
    private Integer status;

    /**
     * 页码，从1开始
     */
    private Integer pageNum = 1;

    /**
     * 每页数量
     */
    private Integer pageSize = 10;
}