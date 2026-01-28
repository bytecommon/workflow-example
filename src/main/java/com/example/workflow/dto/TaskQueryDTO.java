package com.example.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 任务查询DTO
 */
@Data
public class TaskQueryDTO {

    /**
     * 用户ID
     */
    @NotBlank(message = "用户ID不能为空")
    private String userId;

    /**
     * 页码，从1开始
     */
    private Integer pageNum = 1;

    /**
     * 每页数量
     */
    private Integer pageSize = 10;
}
