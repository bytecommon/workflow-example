package com.example.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 流程实例查询DTO
 */
@Data
public class InstanceQueryDTO {

    /**
     * 用户ID
     */
    @NotBlank(message = "用户ID不能为空")
    private String userId;

    /**
     * 流程状态
     * RUNNING-运行中，APPROVED-已通过，REJECTED-已拒绝，CANCELED-已取消，TERMINATED-已终止
     */
    private String status;

    /**
     * 页码，从1开始
     */
    private Integer pageNum = 1;

    /**
     * 每页数量
     */
    private Integer pageSize = 10;
}
