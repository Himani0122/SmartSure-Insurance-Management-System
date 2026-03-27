package com.smartcourier.admin.service;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.feign.AuthClient;
import com.smartcourier.admin.feign.ClaimsClient;
import com.smartcourier.admin.feign.PolicyClient;
import com.smartcourier.admin.messaging.ClaimEventProducer;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final ClaimsClient claimsClient;
    private final AuthClient authClient;
    private final PolicyClient policyClient;
    private final ClaimEventProducer claimEventProducer;

    @CircuitBreaker(name = "claimsService", fallbackMethod = "reviewClaimFallback")
    @Retry(name = "claimsService", fallbackMethod = "reviewClaimFallback")
    public String reviewClaim(Long claimId, AdminReviewRequest request) {
        log.info("Admin tracking claim {}", claimId);
        ClaimResponse claim = claimsClient.getClaimById(claimId);
        
        log.info("Claim found. Issuing update via RabbitMQ for status: {}", request.getStatus());
        claimEventProducer.sendClaimStatusUpdate(claim.getId(), request.getStatus());
        
        return "Review submitted successfully. Claim status update initiated via queue.";
    }

    public String reviewClaimFallback(Long claimId, AdminReviewRequest request, Throwable ex) {
        log.error("Failed to reach Claims Service for claim {}, taking fallback path. Error: {}", claimId, ex.getMessage());
        return "Claims Service is currently unavailable. Review request has been locally logged but not processed.";
    }

    // CLAIM MANAGEMENT
    public List<ClaimResponse> getAllClaims() {
        return claimsClient.getAllClaims();
    }

    public List<ClaimResponse> getPendingClaims() {
        return claimsClient.getPendingClaims();
    }

    public ClaimResponse getClaimById(Long id) {
        return claimsClient.getClaimById(id);
    }

    public String approveClaim(Long id) {
        AdminReviewRequest request = new AdminReviewRequest();
        request.setStatus("APPROVED");
        request.setComments("Approved by Admin");
        return reviewClaim(id, request);
    }

    public String rejectClaim(Long id) {
        AdminReviewRequest request = new AdminReviewRequest();
        request.setStatus("REJECTED");
        request.setComments("Rejected by Admin");
        return reviewClaim(id, request);
    }

    // USER MANAGEMENT
    public List<Map<String, Object>> getAllUsers() {
        return authClient.getAllUsers();
    }

    public String blockUser(Long id) {
        authClient.blockUser(id);
        return "User blocked successfully";
    }

    public String activateUser(Long id) {
        authClient.activateUser(id);
        return "User activated successfully";
    }

    // REPORTS
    public Map<String, Object> getGeneralReport() {
        Map<String, Object> report = new HashMap<>();
        try {
            report.put("totalClaims", claimsClient.getAllClaims().size());
            report.put("totalUsers", authClient.getAllUsers().size());
            report.put("totalPolicies", policyClient.getPolicies().size());
        } catch (Exception e) {
            log.warn("Failed to fetch complete report data: {}", e.getMessage());
        }
        return report;
    }

    public List<ClaimResponse> getClaimsReport() {
        return claimsClient.getAllClaims();
    }

    public List<Map<String, Object>> getPoliciesReport() {
        return policyClient.getPolicies();
    }
}
