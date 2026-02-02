package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 流程模板实体
 * 用于定义流程的基本功能和结构，作为流程定义的模板
 */
@Data
@TableName("workflow_template")
public class WorkflowTemplate {

    /**
     * 模板ID
     * 主键，自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 模板唯一标识
     * 用于区分不同的流程模板，如：simple_approve、multi_approve
     */
    private String templateKey;

    /**
     * 模板名称
     * 模板的显示名称，如：简单审批流程、多级审批流程
     */
    private String templateName;

    /**
     * 模板描述
     * 对模板的详细说明
     */
    private String templateDesc;

    /**
     * 模板分类
     * 例如：通用、人事管理、财务管理、行政管理
     */
    private String category;

    /**
     * 版本号
     * 模板的版本，从1开始递增
     */
    private Integer version;

    /**
     * 状态
     * 0-停用，1-启用
     */
    private Integer status;

    /**
     * 模板图标
     * 用于前端展示的模板图标
     */
    private String icon;

    /**
     * 排序序号
     * 模板在列表中的显示顺序
     */
    private Integer sortOrder;

    /**
     * 创建人
     * 创建模板的用户
     */
    private String createBy;

    /**
     * 创建时间
     * 模板的创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新人
     * 最后更新模板的用户
     */
    private String updateBy;

    /**
     * 更新时间
     * 模板的最后更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 删除标记
     * 逻辑删除标记，0-未删除，1-已删除
     */
    @TableLogic
    private Integer deleted;
}
