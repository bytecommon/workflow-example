package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowTask;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工作流任务Mapper
 */
@Mapper
public interface WorkflowTaskMapper extends BaseMapper<WorkflowTask> {
}
