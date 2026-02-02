package com.example.workflow.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.workflow.entity.WorkflowTemplateNode;
import org.apache.ibatis.annotations.Mapper;

/**
 * 流程模板节点Mapper
 */
@Mapper
public interface WorkflowTemplateNodeMapper extends BaseMapper<WorkflowTemplateNode> {
}
