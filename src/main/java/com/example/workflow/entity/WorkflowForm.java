package com.example.workflow.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 自定义表单实体
 * 用于存储工作流关联的自定义表单配置信息
 */
@Data
@TableName("workflow_form")
public class WorkflowForm {

    /**
     * 表单ID
     * 主键，自增
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 表单唯一标识
     * 用于区分不同的表单模板
     */
    private String formKey;

    /**
     * 表单名称
     * 表单的显示名称
     */
    private String formName;

    /**
     * 表单描述
     * 表单的详细说明
     */
    private String formDesc;

    /**
     * 表单配置
     * JSON格式，存储表单的字段配置、布局等信息
     */
    private String formConfig;

    /**
     * 表单状态
     * 0-停用，1-启用
     */
    private Integer status;

    /**
     * 创建人
     * 记录表单的创建人
     */
    private String createBy;

    /**
     * 创建时间
     * 表单的创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新人
     * 记录表单的最后一次更新人
     */
    private String updateBy;

    /**
     * 更新时间
     * 表单的最后一次更新时间
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
