package com.example.workflow.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.dto.WorkflowTemplateConfigDTO;
import com.example.workflow.dto.WorkflowTemplateDTO;
import com.example.workflow.dto.WorkflowTemplateQueryDTO;
import com.example.workflow.vo.WorkflowTemplateDetailVO;
import com.example.workflow.vo.WorkflowTemplateVO;

/**
 * 流程模板服务接口
 */
public interface WorkflowTemplateService {

    /**
     * 创建流程模板
     */
    Long createTemplate(WorkflowTemplateDTO dto);

    /**
     * 更新流程模板
     */
    void updateTemplate(Long id, WorkflowTemplateDTO dto);

    /**
     * 删除流程模板
     */
    void deleteTemplate(Long id);

    /**
     * 发布/启用流程模板
     */
    void publishTemplate(Long id);

    /**
     * 获取流程模板详情
     */
    WorkflowTemplateDetailVO getTemplateDetail(Long id);

    /**
     * 获取流程模板列表
     */
    Page<WorkflowTemplateVO> getTemplates(WorkflowTemplateQueryDTO query);

    /**
     * 保存流程模板配置（节点和连线）
     */
    void saveTemplateConfig(Long templateId, WorkflowTemplateConfigDTO config);

    /**
     * 根据模板创建流程定义
     */
    Long createDefinitionFromTemplate(Long templateId, String workflowName, String workflowKey);
}
