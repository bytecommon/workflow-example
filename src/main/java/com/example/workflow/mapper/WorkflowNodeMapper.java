package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowNode;
import org.apache.ibatis.annotations.Mapper;

/**
 * 工作流节点Mapper
 */
@Mapper
public interface WorkflowNodeMapper extends BaseMapper<WorkflowNode> {
}
