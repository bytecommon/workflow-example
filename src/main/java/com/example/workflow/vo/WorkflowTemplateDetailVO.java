package com.example.workflow.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 流程模板详情VO
 */
@Data
public class WorkflowTemplateDetailVO {

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

    /**
     * 模板节点列表
     */
    private List<TemplateNodeVO> nodes;

    /**
     * 模板连线列表
     */
    private List<TemplateEdgeVO> edges;

    /**
     * 模板节点VO
     */
    @Data
    public static class TemplateNodeVO {
        private Long id;
        private String nodeKey;
        private String nodeName;
        private String nodeType;
        private Integer positionX;
        private Integer positionY;
        private String config;
        private LocalDateTime createTime;
        private LocalDateTime updateTime;
    }

    /**
     * 模板连线VO
     */
    @Data
    public static class TemplateEdgeVO {
        private Long id;
        private Long sourceNodeId;
        private Long targetNodeId;
        private String conditionExpr;
        private Integer priority;
        private LocalDateTime createTime;
    }
}
