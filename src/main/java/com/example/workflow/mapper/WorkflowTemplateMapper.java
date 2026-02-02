package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowTemplate;
import org.apache.ibatis.annotations.Mapper;

/**
 * 流程模板Mapper
 */
@Mapper
public interface WorkflowTemplateMapper extends BaseMapper<WorkflowTemplate> {
}
