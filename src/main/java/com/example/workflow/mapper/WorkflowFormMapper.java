package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowForm;
import org.apache.ibatis.annotations.Mapper;

/**
 * 表单Mapper
 */
@Mapper
public interface WorkflowFormMapper extends BaseMapper<WorkflowForm> {
}
