package com.workflow.service.approver;

import com.workflow.entity.WorkflowApprover;
import com.workflow.exception.WorkflowEngineException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Approver Resolver Service
 * 
 * High-level service for resolving workflow approvers.
 * Provides methods to resolve single and multiple approvers with caching and batching support.
 * 
 * @author bytecommon
 * @date 2026-04-22
 */
@Slf4j
@Service
public class ApproverResolverService {

    private final ApproverResolverFactory factory;

    @Autowired
    public ApproverResolverService(ApproverResolverFactory factory) {
        this.factory = factory;
    }

    /**
     * Resolve a single approver configuration to a list of user IDs
     * 
     * @param approver the WorkflowApprover configuration
     * @param contextData additional context data (e.g., form data, variables)
     * @return list of resolved user IDs
     * @throws WorkflowEngineException if resolution fails
     */
    public List<String> resolveApprover(WorkflowApprover approver, Map<String, Object> contextData) {
        if (approver == null) {
            throw new WorkflowEngineException("Approver configuration cannot be null");
        }

        try {
            ApproverResolver resolver = factory.getResolver(approver.getApproverType());
            List<String> resolvedApprovers = resolver.resolve(approver, contextData);

            log.debug("Resolved approver [type: {}, id: {}] to users: {}", 
                approver.getApproverType(), approver.getApproverId(), resolvedApprovers);

            return resolvedApprovers;
        } catch (WorkflowEngineException e) {
            log.error("Failed to resolve approver: {}", approver, e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error resolving approver", e);
            throw new WorkflowEngineException("Unexpected error resolving approver: " + e.getMessage(), e);
        }
    }

    /**
     * Resolve multiple approver configurations to a deduplicated list of user IDs
     * 
     * @param approvers list of WorkflowApprover configurations
     * @param contextData additional context data
     * @return deduplicated list of all resolved user IDs
     * @throws WorkflowEngineException if any resolution fails
     */
    public List<String> resolveApprovers(List<WorkflowApprover> approvers, Map<String, Object> contextData) {
        if (approvers == null || approvers.isEmpty()) {
            return new ArrayList<>();
        }

        try {
            return approvers.stream()
                .flatMap(approver -> resolveApprover(approver, contextData).stream())
                .distinct()  // Remove duplicates
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to resolve multiple approvers", e);
            throw e;
        }
    }

    /**
     * Resolve approvers by their type and IDs
     * 
     * @param approverType the type of approver
     * @param approverId the approver identifier
     * @param contextData additional context data
     * @return list of resolved user IDs
     * @throws WorkflowEngineException if resolution fails
     */
    public List<String> resolveByTypeAndId(String approverType, String approverId, Map<String, Object> contextData) {
        WorkflowApprover approver = new WorkflowApprover();
        approver.setApproverType(approverType);
        approver.setApproverId(approverId);
        return resolveApprover(approver, contextData);
    }

    /**
     * Validate that an approver type is supported
     * 
     * @param approverType the type to validate
     * @return true if the type is supported
     */
    public boolean isApproverTypeSupported(String approverType) {
        return factory.hasResolver(approverType);
    }

    /**
     * Get all supported approver types
     * 
     * @return list of supported approver types
     */
    public List<String> getSupportedApproverTypes() {
        return factory.getSupportedTypes();
    }
}