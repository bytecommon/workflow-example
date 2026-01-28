package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowDefinition;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工作流定义Mapper
 */
@Mapper
public interface WorkflowDefinitionMapper extends BaseMapper<WorkflowDefinition> {
}
