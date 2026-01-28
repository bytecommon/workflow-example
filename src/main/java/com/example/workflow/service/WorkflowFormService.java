package com.example.workflow.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.dto.WorkflowFormDTO;
import com.example.workflow.vo.WorkflowFormVO;

/**
 * 表单服务接口
 */
public interface WorkflowFormService {
    
    /**
     * 创建表单
     */
    Long createForm(WorkflowFormDTO dto);
    
    /**
     * 更新表单
     */
    void updateForm(Long id, WorkflowFormDTO dto);
    
    /**
     * 删除表单
     */
    void deleteForm(Long id);
    
    /**
     * 获取表单详情
     */
    WorkflowFormVO getFormDetail(Long id);
    
    /**
     * 获取表单列表
     */
    Page<WorkflowFormVO> getFormList(Integer pageNum, Integer pageSize, String formName);
}
