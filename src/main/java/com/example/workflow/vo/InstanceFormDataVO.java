package com.example.workflow.vo;

import lombok.Data;

import java.util.Map;

/**
 * 流程实例表单数据VO
 */
@Data
public class InstanceFormDataVO {

    /**
     * 流程实例ID
     */
    private Long instanceId;

    /**
     * 流程实例编号
     */
    private String instanceNo;

    /**
     * 表单ID
     */
    private Long formId;

    /**
     * 表单名称
     */
    private String formName;

    /**
     * 表单配置（JSON格式）
     */
    private String formConfig;

    /**
     * 表单数据（JSON格式）
     */
    private String formData;

    /**
     * 表单数据（解析为Map）
     */
    private Map<String, Object> dataMap;
}
