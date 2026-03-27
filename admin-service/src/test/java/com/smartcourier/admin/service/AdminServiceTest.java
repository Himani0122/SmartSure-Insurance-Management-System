package com.smartcourier.admin.service;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.feign.ClaimsClient;
import com.smartcourier.admin.feign.AuthClient;
import com.smartcourier.admin.feign.PolicyClient;
import com.smartcourier.admin.messaging.ClaimEventProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private ClaimsClient claimsClient;

    @Mock
    private AuthClient authClient;

    @Mock
    private PolicyClient policyClient;

    @Mock
    private ClaimEventProducer claimEventProducer;

    @InjectMocks
    private AdminService adminService;

    private AdminReviewRequest testRequest;
    private ClaimResponse testClaim;

    @BeforeEach
    void setUp() {
        testRequest = new AdminReviewRequest();
        testRequest.setStatus("APPROVED");

        testClaim = ClaimResponse.builder()
                .id(1L)
                .status("PENDING")
                .build();
    }

    @Test
    void reviewClaim_Success() {
        when(claimsClient.getClaimById(1L)).thenReturn(testClaim);

        String result = adminService.reviewClaim(1L, testRequest);

        assertEquals("Review submitted successfully. Claim status update initiated via queue.", result);
        verify(claimsClient, times(1)).getClaimById(1L);
        verify(claimEventProducer, times(1)).sendClaimStatusUpdate(1L, "APPROVED");
    }

    @Test
    void reviewClaimFallback_ShouldReturnErrorMessage() {
        String result = adminService.reviewClaimFallback(1L, testRequest, new RuntimeException("Service down"));
        
        assertEquals("Claims Service is currently unavailable. Review request has been locally logged but not processed.", result);
    }

    @Test
    void getAllClaims_ShouldReturnList() {
        when(claimsClient.getAllClaims()).thenReturn(java.util.List.of(testClaim));
        
        java.util.List<ClaimResponse> result = adminService.getAllClaims();
        
        assertEquals(1, result.size());
        verify(claimsClient, times(1)).getAllClaims();
    }

    @Test
    void approveClaim_ShouldInitiateReview() {
        when(claimsClient.getClaimById(1L)).thenReturn(testClaim);
        
        String result = adminService.approveClaim(1L);
        
        assertEquals("Review submitted successfully. Claim status update initiated via queue.", result);
        verify(claimEventProducer, times(1)).sendClaimStatusUpdate(1L, "APPROVED");
    }

    @Test
    void rejectClaim_ShouldInitiateReview() {
        when(claimsClient.getClaimById(1L)).thenReturn(testClaim);
        
        String result = adminService.rejectClaim(1L);
        
        assertEquals("Review submitted successfully. Claim status update initiated via queue.", result);
        verify(claimEventProducer, times(1)).sendClaimStatusUpdate(1L, "REJECTED");
    }

    @Test
    void getAllUsers_ShouldReturnList() {
        java.util.Map<String, Object> user = new java.util.HashMap<>();
        user.put("id", 1);
        when(authClient.getAllUsers()).thenReturn(java.util.List.of(user));
        
        java.util.List<java.util.Map<String, Object>> result = adminService.getAllUsers();
        
        assertEquals(1, result.size());
    }

    @Test
    void blockUser_ShouldCallAuthClient() {
        String result = adminService.blockUser(1L);
        assertEquals("User blocked successfully", result);
        verify(authClient, times(1)).blockUser(1L);
    }

    @Test
    void getGeneralReport_ShouldReturnMap() {
        when(claimsClient.getAllClaims()).thenReturn(java.util.List.of(testClaim));
        when(authClient.getAllUsers()).thenReturn(java.util.List.of(new java.util.HashMap<>()));
        when(policyClient.getPolicies()).thenReturn(java.util.List.of(new java.util.HashMap<>()));
        
        java.util.Map<String, Object> result = adminService.getGeneralReport();
        
        assertEquals(1, result.get("totalClaims"));
        assertEquals(1, result.get("totalUsers"));
        assertEquals(1, result.get("totalPolicies"));
    }

    @Test
    void getGeneralReport_ShouldHandleException() {
        when(claimsClient.getAllClaims()).thenThrow(new RuntimeException("Error"));
        
        java.util.Map<String, Object> result = adminService.getGeneralReport();
        
        assertTrue(result.isEmpty());
    }

    @Test
    void getPendingClaims_ShouldReturnList() {
        when(claimsClient.getPendingClaims()).thenReturn(java.util.List.of(testClaim));
        java.util.List<ClaimResponse> result = adminService.getPendingClaims();
        assertEquals(1, result.size());
    }

    @Test
    void getClaimById_ShouldReturnClaim() {
        when(claimsClient.getClaimById(1L)).thenReturn(testClaim);
        ClaimResponse result = adminService.getClaimById(1L);
        assertEquals(1L, result.getId());
    }

    @Test
    void activateUser_ShouldCallAuthClient() {
        String result = adminService.activateUser(1L);
        assertEquals("User activated successfully", result);
        verify(authClient, times(1)).activateUser(1L);
    }

    @Test
    void getClaimsReport_ShouldReturnList() {
        when(claimsClient.getAllClaims()).thenReturn(java.util.List.of(testClaim));
        java.util.List<ClaimResponse> result = adminService.getClaimsReport();
        assertEquals(1, result.size());
    }

    @Test
    void getPoliciesReport_ShouldReturnList() {
        java.util.Map<String, Object> policy = new java.util.HashMap<>();
        when(policyClient.getPolicies()).thenReturn(java.util.List.of(policy));
        java.util.List<java.util.Map<String, Object>> result = adminService.getPoliciesReport();
        assertEquals(1, result.size());
    }
}
