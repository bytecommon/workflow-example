package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowApprover;
import org.apache.ibatis.annotations.Mapper;

/**
 * 审批人配置Mapper
 */
@Mapper
public interface WorkflowApproverMapper extends BaseMapper<WorkflowApprover> {
}
