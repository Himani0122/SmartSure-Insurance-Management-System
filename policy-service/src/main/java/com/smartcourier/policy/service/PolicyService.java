package com.smartcourier.policy.service;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.entity.Policy;
import com.smartcourier.policy.entity.PolicyPurchaseSaga;
import com.smartcourier.policy.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;
import com.smartcourier.policy.repository.PolicyPurchaseSagaRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final SagaOrchestrator sagaOrchestrator;
    private final PolicyPurchaseSagaRepository sagaRepository;

    @Transactional
    @CacheEvict(value = "policies", allEntries = true)
    public PolicyResponse createPolicy(PolicyRequest request) {
        Policy policy = Policy.builder()
                .name(request.getName())
                .description(request.getDescription())
                .basePremium(request.getBasePremium())
                .type(request.getType() != null ? request.getType() : "GENERAL")
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .expiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : LocalDateTime.now().plusYears(1))
                .build();
        Policy saved = policyRepository.save(policy);
        return mapToResponse(saved);
    }

    @Cacheable(value = "policies", key = "'all_policies'")
    public List<PolicyResponse> getPolicies() {
        return policyRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public PolicyResponse getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        return mapToResponse(policy);
    }

    @Transactional
    @CacheEvict(value = {"policies", "premium"}, allEntries = true)
    public PolicyResponse updatePolicy(Long id, PolicyRequest request) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        policy.setName(request.getName());
        policy.setDescription(request.getDescription());
        policy.setBasePremium(request.getBasePremium());
        policy.setType(request.getType());
        if (request.getStatus() != null) policy.setStatus(request.getStatus());
        if (request.getExpiryDate() != null) policy.setExpiryDate(request.getExpiryDate());
        
        Policy updated = policyRepository.save(policy);
        return mapToResponse(updated);
    }

    @Transactional
    @CacheEvict(value = "policies", allEntries = true)
    public void deletePolicy(Long id) {
        policyRepository.deleteById(id);
    }

    public List<PolicyResponse> getPoliciesByType(String type) {
        return policyRepository.findByType(type).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PolicyResponse> getActivePolicies() {
        return policyRepository.findByStatus("ACTIVE").stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PolicyResponse> getExpiredPolicies() {
        return policyRepository.findByStatus("EXPIRED").stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PolicyResponse> searchPolicies(String query) {
        return policyRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PolicyResponse> getUserPurchasedPolicies(String username) {
        List<PolicyPurchaseSaga> sagas = sagaRepository.findByUserIdAndStatus(username, "COMPLETED");
        return sagas.stream()
                .map(saga -> policyRepository.findById(saga.getPolicyId()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "policies", allEntries = true)
    public String cancelPolicy(Long id, String username) {
        // Simple cancellation logic: just mark as CANCELLED if it's currently ACTIVE
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        policy.setStatus("CANCELLED");
        policyRepository.save(policy);
        return "Policy cancelled successfully";
    }

    @Cacheable(value = "premium", key = "#id")
    public BigDecimal calculatePremium(Long id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        return policy.getBasePremium().multiply(BigDecimal.valueOf(1.05));
    }

    public String purchasePolicy(Long id, String userId) {
        PolicyPurchaseSaga saga = sagaOrchestrator.startPurchaseSaga(userId, id);
        log.info("Purchase saga initiated: sagaId={}, policyId={}, userId={}", saga.getId(), id, userId);
        return "Policy purchase saga initiated. Saga ID: " + saga.getId() + ". Track status for updates.";
    }

    private PolicyResponse mapToResponse(Policy policy) {
        return PolicyResponse.builder()
                .id(policy.getId())
                .name(policy.getName())
                .description(policy.getDescription())
                .basePremium(policy.getBasePremium())
                .type(policy.getType())
                .status(policy.getStatus())
                .expiryDate(policy.getExpiryDate())
                .build();
    }
}
