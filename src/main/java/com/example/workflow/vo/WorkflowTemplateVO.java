package com.example.workflow.vo;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 流程模板VO
 */
@Data
public class WorkflowTemplateVO {

    /**
     * 模板ID
     */
    private Long id;

    /**
     * 模板唯一标识
     */
    private String templateKey;

    /**
     * 模板名称
     */
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
     * 版本号
     */
    private Integer version;

    /**
     * 状态：0-停用，1-启用
     */
    private Integer status;

    /**
     * 模板图标
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
