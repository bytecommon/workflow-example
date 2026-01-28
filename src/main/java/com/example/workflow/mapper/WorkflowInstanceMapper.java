package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowInstance;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工作流实例Mapper
 */
@Mapper
public interface WorkflowInstanceMapper extends BaseMapper<WorkflowInstance> {
}
