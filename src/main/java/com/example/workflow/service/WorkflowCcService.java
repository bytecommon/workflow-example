package com.example.workflow.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.vo.WorkflowCcVO;

/**
 * 工作流抄送服务
 */
public interface WorkflowCcService {
    
    /**
     * 获取我的抄送
     */
    Page<WorkflowCcVO> getMyCc(String userId, Integer pageNum, Integer pageSize);
    
    /**
     * 标记为已读
     */
    void markAsRead(Long id);
}



