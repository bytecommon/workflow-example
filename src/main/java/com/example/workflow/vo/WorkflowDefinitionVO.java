package com.example.workflow.vo;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 工作流定义VO
 */
@Data
public class WorkflowDefinitionVO {

    /**
     * 工作流ID
     */
    private Long id;

    /**
     * 工作流唯一标识
     */
    private String workflowKey;

    /**
     * 工作流名称
     */
    private String workflowName;

    /**
     * 工作流描述
     */
    private String workflowDesc;

    /**
     * 工作流分类
     */
    private String category;

    /**
     * 版本号
     */
    private Integer version;

    /**
     * 状态：0-停用，1-启用
     */
    private Integer status;

    /**
     * 关联表单ID
     */
    private Long formId;

    /**
     * 工作流图标
     */
    private String icon;

    /**
     * 排序序号
     */
    private Integer sortOrder;

    /**
     * 创建人
     */
    private String createBy;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新人
     */
    private String updateBy;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;
}