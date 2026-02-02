package com.example.workflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.workflow.dto.WorkflowTemplateConfigDTO;
import com.example.workflow.dto.WorkflowTemplateDTO;
import com.example.workflow.dto.WorkflowTemplateQueryDTO;
import com.example.workflow.entity.WorkflowDefinition;
import com.example.workflow.entity.WorkflowEdge;
import com.example.workflow.entity.WorkflowNode;
import com.example.workflow.entity.WorkflowTemplate;
import com.example.workflow.entity.WorkflowTemplateEdge;
import com.example.workflow.entity.WorkflowTemplateNode;
import com.example.workflow.mapper.WorkflowDefinitionMapper;
import com.example.workflow.mapper.WorkflowEdgeMapper;
import com.example.workflow.mapper.WorkflowNodeMapper;
import com.example.workflow.mapper.WorkflowTemplateEdgeMapper;
import com.example.workflow.mapper.WorkflowTemplateMapper;
import com.example.workflow.mapper.WorkflowTemplateNodeMapper;
import com.example.workflow.service.WorkflowTemplateService;
import com.example.workflow.vo.WorkflowTemplateDetailVO;
import com.example.workflow.vo.WorkflowTemplateVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 流程模板服务实现
 */
@Service
@RequiredArgsConstructor
public class WorkflowTemplateServiceImpl implements WorkflowTemplateService {

    private final WorkflowTemplateMapper workflowTemplateMapper;
    private final WorkflowTemplateNodeMapper workflowTemplateNodeMapper;
    private final WorkflowTemplateEdgeMapper workflowTemplateEdgeMapper;
    private final WorkflowDefinitionMapper workflowDefinitionMapper;
    private final WorkflowNodeMapper workflowNodeMapper;
    private final WorkflowEdgeMapper workflowEdgeMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createTemplate(WorkflowTemplateDTO dto) {
        WorkflowTemplate template = new WorkflowTemplate();
        template.setTemplateKey(dto.getTemplateKey());
        template.setTemplateName(dto.getTemplateName());
        template.setTemplateDesc(dto.getTemplateDesc());
        template.setCategory(dto.getCategory());
        template.setIcon(dto.getIcon());
        template.setSortOrder(dto.getSortOrder());
        template.setStatus(0); // 初始为停用状态
        template.setVersion(1);

        workflowTemplateMapper.insert(template);
        return template.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTemplate(Long id, WorkflowTemplateDTO dto) {
        WorkflowTemplate template = workflowTemplateMapper.selectById(id);
        if (template == null) {
            throw new RuntimeException("流程模板不存在");
        }

        template.setTemplateKey(dto.getTemplateKey());
        template.setTemplateName(dto.getTemplateName());
        template.setTemplateDesc(dto.getTemplateDesc());
        template.setCategory(dto.getCategory());
        template.setIcon(dto.getIcon());
        template.setSortOrder(dto.getSortOrder());
        if (dto.getStatus() != null) {
            template.setStatus(dto.getStatus());
        }

        workflowTemplateMapper.updateById(template);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTemplate(Long id) {
        // 检查是否有基于此模板的流程定义
        Long count = workflowDefinitionMapper.selectCount(
            new LambdaQueryWrapper<WorkflowDefinition>()
                .eq(WorkflowDefinition::getTemplateId, id)
        );

        if (count > 0) {
            throw new RuntimeException("存在基于此模板的流程定义，无法删除");
        }

        workflowTemplateMapper.deleteById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void publishTemplate(Long id) {
        WorkflowTemplate template = workflowTemplateMapper.selectById(id);
        if (template == null) {
            throw new RuntimeException("流程模板不存在");
        }

        if (template.getStatus() == 1) {
            throw new RuntimeException("模板已经是启用状态");
        }

        template.setStatus(1);
        workflowTemplateMapper.updateById(template);
    }

    @Override
    public WorkflowTemplateDetailVO getTemplateDetail(Long id) {
        WorkflowTemplate template = workflowTemplateMapper.selectById(id);
        if (template == null) {
            throw new RuntimeException("流程模板不存在");
        }

        WorkflowTemplateDetailVO detail = new WorkflowTemplateDetailVO();
        detail.setId(template.getId());
        detail.setTemplateKey(template.getTemplateKey());
        detail.setTemplateName(template.getTemplateName());
        detail.setTemplateDesc(template.getTemplateDesc());
        detail.setCategory(template.getCategory());
        detail.setVersion(template.getVersion());
        detail.setStatus(template.getStatus());
        detail.setIcon(template.getIcon());
        detail.setSortOrder(template.getSortOrder());
        detail.setCreateBy(template.getCreateBy());
        detail.setCreateTime(template.getCreateTime());
        detail.setUpdateBy(template.getUpdateBy());
        detail.setUpdateTime(template.getUpdateTime());

        // 获取节点
        List<WorkflowTemplateNode> nodes = workflowTemplateNodeMapper.selectList(
            new LambdaQueryWrapper<WorkflowTemplateNode>()
                .eq(WorkflowTemplateNode::getTemplateId, id)
        );

        if (nodes != null && !nodes.isEmpty()) {
            List<WorkflowTemplateDetailVO.TemplateNodeVO> nodeVOList = nodes.stream().map(node -> {
                WorkflowTemplateDetailVO.TemplateNodeVO nodeVO = new WorkflowTemplateDetailVO.TemplateNodeVO();
                nodeVO.setId(node.getId());
                nodeVO.setNodeKey(node.getNodeKey());
                nodeVO.setNodeName(node.getNodeName());
                nodeVO.setNodeType(node.getNodeType());
                nodeVO.setPositionX(node.getPositionX());
                nodeVO.setPositionY(node.getPositionY());
                nodeVO.setConfig(node.getConfig());
                nodeVO.setCreateTime(node.getCreateTime());
                nodeVO.setUpdateTime(node.getUpdateTime());
                return nodeVO;
            }).collect(Collectors.toList());
            detail.setNodes(nodeVOList);
        }

        // 获取连线
        List<WorkflowTemplateEdge> edges = workflowTemplateEdgeMapper.selectList(
            new LambdaQueryWrapper<WorkflowTemplateEdge>()
                .eq(WorkflowTemplateEdge::getTemplateId, id)
        );

        if (edges != null && !edges.isEmpty()) {
            List<WorkflowTemplateDetailVO.TemplateEdgeVO> edgeVOList = edges.stream().map(edge -> {
                WorkflowTemplateDetailVO.TemplateEdgeVO edgeVO = new WorkflowTemplateDetailVO.TemplateEdgeVO();
                edgeVO.setId(edge.getId());
                edgeVO.setSourceNodeId(edge.getSourceNodeId());
                edgeVO.setTargetNodeId(edge.getTargetNodeId());
                edgeVO.setConditionExpr(edge.getConditionExpr());
                edgeVO.setPriority(edge.getPriority());
                edgeVO.setCreateTime(edge.getCreateTime());
                return edgeVO;
            }).collect(Collectors.toList());
            detail.setEdges(edgeVOList);
        }

        return detail;
    }

    @Override
    public Page<WorkflowTemplateVO> getTemplates(WorkflowTemplateQueryDTO query) {
        Page<WorkflowTemplate> page = new Page<>(query.getPageNum(), query.getPageSize());

        LambdaQueryWrapper<WorkflowTemplate> wrapper = new LambdaQueryWrapper<>();

        if (query.getTemplateName() != null && !query.getTemplateName().isEmpty()) {
            wrapper.like(WorkflowTemplate::getTemplateName, query.getTemplateName());
        }

        if (query.getCategory() != null && !query.getCategory().isEmpty()) {
            wrapper.eq(WorkflowTemplate::getCategory, query.getCategory());
        }

        if (query.getStatus() != null) {
            wrapper.eq(WorkflowTemplate::getStatus, query.getStatus());
        }

        wrapper.orderByAsc(WorkflowTemplate::getSortOrder)
               .orderByDesc(WorkflowTemplate::getCreateTime);

        Page<WorkflowTemplate> templatePage = workflowTemplateMapper.selectPage(page, wrapper);

        // 转换为VO
        Page<WorkflowTemplateVO> voPage = new Page<>(templatePage.getCurrent(), templatePage.getSize(), templatePage.getTotal());
        List<WorkflowTemplateVO> voList = templatePage.getRecords().stream().map(template -> {
            WorkflowTemplateVO vo = new WorkflowTemplateVO();
            vo.setId(template.getId());
            vo.setTemplateKey(template.getTemplateKey());
            vo.setTemplateName(template.getTemplateName());
            vo.setTemplateDesc(template.getTemplateDesc());
            vo.setCategory(template.getCategory());
            vo.setVersion(template.getVersion());
            vo.setStatus(template.getStatus());
            vo.setIcon(template.getIcon());
            vo.setSortOrder(template.getSortOrder());
            vo.setCreateBy(template.getCreateBy());
            vo.setCreateTime(template.getCreateTime());
            vo.setUpdateBy(template.getUpdateBy());
            vo.setUpdateTime(template.getUpdateTime());
            return vo;
        }).collect(Collectors.toList());

        voPage.setRecords(voList);
        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveTemplateConfig(Long templateId, WorkflowTemplateConfigDTO config) {
        // 删除旧的节点和连线
        workflowTemplateNodeMapper.delete(
            new LambdaQueryWrapper<WorkflowTemplateNode>()
                .eq(WorkflowTemplateNode::getTemplateId, templateId)
        );

        workflowTemplateEdgeMapper.delete(
            new LambdaQueryWrapper<WorkflowTemplateEdge>()
                .eq(WorkflowTemplateEdge::getTemplateId, templateId)
        );

        // 保存节点
        if (config.getNodes() != null && !config.getNodes().isEmpty()) {
            for (WorkflowTemplateNode node : config.getNodes()) {
                node.setTemplateId(templateId);
                workflowTemplateNodeMapper.insert(node);
            }
        }

        // 保存连线
        if (config.getEdges() != null && !config.getEdges().isEmpty()) {
            for (WorkflowTemplateEdge edge : config.getEdges()) {
                edge.setTemplateId(templateId);
                workflowTemplateEdgeMapper.insert(edge);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createDefinitionFromTemplate(Long templateId, String workflowName, String workflowKey) {
        // 获取模板
        WorkflowTemplate template = workflowTemplateMapper.selectById(templateId);
        if (template == null) {
            throw new RuntimeException("流程模板不存在");
        }

        // 检查模板是否已启用
        if (template.getStatus() != 1) {
            throw new RuntimeException("流程模板未启用，无法创建流程定义");
        }

        // 创建流程定义
        WorkflowDefinition definition = new WorkflowDefinition();
        definition.setWorkflowKey(workflowKey);
        definition.setWorkflowName(workflowName);
        definition.setWorkflowDesc(template.getTemplateDesc());
        definition.setCategory(template.getCategory());
        definition.setTemplateId(templateId);
        definition.setIcon(template.getIcon());
        definition.setSortOrder(template.getSortOrder());
        definition.setStatus(0); // 初始为停用状态
        definition.setVersion(1);

        workflowDefinitionMapper.insert(definition);
        Long definitionId = definition.getId();

        // 复制模板节点到流程定义
        List<WorkflowTemplateNode> templateNodes = workflowTemplateNodeMapper.selectList(
            new LambdaQueryWrapper<WorkflowTemplateNode>()
                .eq(WorkflowTemplateNode::getTemplateId, templateId)
        );

        if (templateNodes != null && !templateNodes.isEmpty()) {
            for (WorkflowTemplateNode templateNode : templateNodes) {
                WorkflowNode node = new WorkflowNode();
                node.setWorkflowId(definitionId);
                node.setNodeKey(templateNode.getNodeKey());
                node.setNodeName(templateNode.getNodeName());
                node.setNodeType(templateNode.getNodeType());
                node.setPositionX(templateNode.getPositionX());
                node.setPositionY(templateNode.getPositionY());
                node.setConfig(templateNode.getConfig());
                workflowNodeMapper.insert(node);
            }
        }

        // 复制模板连线到流程定义
        List<WorkflowTemplateEdge> templateEdges = workflowTemplateEdgeMapper.selectList(
            new LambdaQueryWrapper<WorkflowTemplateEdge>()
                .eq(WorkflowTemplateEdge::getTemplateId, templateId)
        );

        if (templateEdges != null && !templateEdges.isEmpty()) {
            // 建立模板节点ID到流程节点ID的映射
            List<WorkflowNode> workflowNodes = workflowNodeMapper.selectList(
                new LambdaQueryWrapper<WorkflowNode>()
                    .eq(WorkflowNode::getWorkflowId, definitionId)
            );

            java.util.Map<Long, Long> templateNodeIdToWorkflowNodeIdMap = new java.util.HashMap<>();
            for (WorkflowNode workflowNode : workflowNodes) {
                // 找到对应的模板节点
                for (WorkflowTemplateNode templateNode : templateNodes) {
                    if (templateNode.getNodeKey().equals(workflowNode.getNodeKey())) {
                        templateNodeIdToWorkflowNodeIdMap.put(templateNode.getId(), workflowNode.getId());
                        break;
                    }
                }
            }

            for (WorkflowTemplateEdge templateEdge : templateEdges) {
                WorkflowEdge edge = new WorkflowEdge();
                edge.setWorkflowId(definitionId);
                edge.setSourceNodeId(templateNodeIdToWorkflowNodeIdMap.get(templateEdge.getSourceNodeId()));
                edge.setTargetNodeId(templateNodeIdToWorkflowNodeIdMap.get(templateEdge.getTargetNodeId()));
                edge.setConditionExpr(templateEdge.getConditionExpr());
                edge.setPriority(templateEdge.getPriority());
                workflowEdgeMapper.insert(edge);
            }
        }

        return definitionId;
    }
}
