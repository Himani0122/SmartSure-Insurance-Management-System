package com.smartcourier.policy.service;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.entity.Policy;
import com.smartcourier.policy.entity.PolicyPurchaseSaga;
import com.smartcourier.policy.repository.PolicyRepository;
import com.smartcourier.policy.repository.PolicyPurchaseSagaRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private SagaOrchestrator sagaOrchestrator;

    @Mock
    private PolicyPurchaseSagaRepository sagaRepository;

    @InjectMocks
    private PolicyService policyService;

    private Policy testPolicy;
    private PolicyPurchaseSaga testSaga;
    private PolicyRequest testRequest;


    @BeforeEach
    void setUp() {
        testPolicy = Policy.builder()
                .id(1L)
                .name("Test Policy")
                .description("Test Description")
                .basePremium(BigDecimal.valueOf(500))
                .type("GENERAL")
                .status("ACTIVE")
                .expiryDate(LocalDateTime.now().plusYears(1))
                .build();

        testRequest = new PolicyRequest();
        testRequest.setName("Test Policy");
        testRequest.setDescription("Test Description");
        testRequest.setType("GENERAL");
        testRequest.setStatus("ACTIVE");
        testRequest.setExpiryDate(LocalDateTime.now().plusYears(1));
        testRequest.setBasePremium(BigDecimal.valueOf(500));
    }

    @Test
    void createPolicy_ShouldSaveAndReturnResponse() {
        when(policyRepository.save(any(Policy.class))).thenReturn(testPolicy);

        PolicyResponse result = policyService.createPolicy(testRequest);

        assertNotNull(result);
        assertEquals(testPolicy.getId(), result.getId());
        assertEquals(testPolicy.getName(), result.getName());
        verify(policyRepository, times(1)).save(any(Policy.class));
    }

    @Test
    void createPolicy_WithNullValues_ShouldUseDefaults() {
        PolicyRequest nullRequest = new PolicyRequest();
        nullRequest.setName("Null Test");
        nullRequest.setBasePremium(BigDecimal.TEN);
        
        when(policyRepository.save(any(Policy.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PolicyResponse result = policyService.createPolicy(nullRequest);

        assertEquals("GENERAL", result.getType());
        assertEquals("ACTIVE", result.getStatus());
        assertNotNull(result.getExpiryDate());
    }

    @Test
    void getPolicies_ShouldReturnList() {
        when(policyRepository.findAll()).thenReturn(List.of(testPolicy));

        List<PolicyResponse> result = policyService.getPolicies();

        assertEquals(1, result.size());
    }

    @Test
    void purchasePolicy_ShouldReturnSuccess() {
        PolicyPurchaseSaga saga = new PolicyPurchaseSaga();
        saga.setId(999L);
        when(sagaOrchestrator.startPurchaseSaga(anyString(), anyLong())).thenReturn(saga);

        String result = policyService.purchasePolicy(1L, "user1");

        assertTrue(result.contains("999"));
    }

    @Test
    void getPolicyById_ShouldReturnResponse_WhenFound() {
        when(policyRepository.findById(1L)).thenReturn(java.util.Optional.of(testPolicy));

        PolicyResponse result = policyService.getPolicyById(1L);

        assertNotNull(result);
        assertEquals(testPolicy.getName(), result.getName());
        verify(policyRepository, times(1)).findById(1L);
    }

    @Test
    void getPolicyById_ShouldThrowException_WhenNotFound() {
        when(policyRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        assertThrows(RuntimeException.class, () -> policyService.getPolicyById(1L));
    }

    @Test
    void updatePolicy_ShouldUpdateAndReturnResponse() {
        when(policyRepository.findById(1L)).thenReturn(java.util.Optional.of(testPolicy));
        when(policyRepository.save(any(Policy.class))).thenReturn(testPolicy);

        PolicyResponse result = policyService.updatePolicy(1L, testRequest);

        assertNotNull(result);
        assertEquals(testRequest.getName(), result.getName());
        verify(policyRepository, times(1)).save(any(Policy.class));
    }

    @Test
    void updatePolicy_ShouldThrowException_WhenNotFound() {
        when(policyRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        assertThrows(RuntimeException.class, () -> policyService.updatePolicy(1L, testRequest));
    }

    @Test
    void deletePolicy_ShouldCallRepository() {
        doNothing().when(policyRepository).deleteById(1L);

        policyService.deletePolicy(1L);

        verify(policyRepository, times(1)).deleteById(1L);
    }

    @Test
    void getPoliciesByType_ShouldReturnList() {
        when(policyRepository.findByType("GENERAL")).thenReturn(List.of(testPolicy));

        List<PolicyResponse> result = policyService.getPoliciesByType("GENERAL");

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(policyRepository, times(1)).findByType("GENERAL");
    }

    @Test
    void getActivePolicies_ShouldReturnList() {
        when(policyRepository.findByStatus("ACTIVE")).thenReturn(List.of(testPolicy));

        List<PolicyResponse> result = policyService.getActivePolicies();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(policyRepository, times(1)).findByStatus("ACTIVE");
    }

    @Test
    void searchPolicies_ShouldReturnList() {
        when(policyRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase("test", "test"))
                .thenReturn(List.of(testPolicy));

        List<PolicyResponse> result = policyService.searchPolicies("test");

        assertNotNull(result);
        assertFalse(result.isEmpty());
    }

    @Test
    void cancelPolicy_ShouldChangeStatus() {
        when(policyRepository.findById(1L)).thenReturn(java.util.Optional.of(testPolicy));
        when(policyRepository.save(any(Policy.class))).thenReturn(testPolicy);

        String result = policyService.cancelPolicy(1L, "user1");

        assertEquals("Policy cancelled successfully", result);
        assertEquals("CANCELLED", testPolicy.getStatus());
        verify(policyRepository, times(1)).save(testPolicy);
    }

    @Test
    void calculatePremium_ShouldReturnIncreasedValue() {
        when(policyRepository.findById(1L)).thenReturn(java.util.Optional.of(testPolicy));

        BigDecimal premium = policyService.calculatePremium(1L);

        assertEquals(0, BigDecimal.valueOf(525.0).compareTo(premium));
    }

    @Test
    void getUserPurchasedPolicies_ShouldReturnList() {
        PolicyPurchaseSaga saga = new PolicyPurchaseSaga();
        saga.setPolicyId(1L);
        saga.setStatus("COMPLETED");

        when(sagaRepository.findByUserIdAndStatus("user1", "COMPLETED")).thenReturn(List.of(saga));
        when(policyRepository.findById(1L)).thenReturn(java.util.Optional.of(testPolicy));

        List<PolicyResponse> result = policyService.getUserPurchasedPolicies("user1");

        assertNotNull(result);
        assertEquals(1, result.size());
    }
}
