package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowEdge;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工作流连线Mapper
 */
@Mapper
public interface WorkflowEdgeMapper extends BaseMapper<WorkflowEdge> {
}
