package com.smartcourier.policy;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.entity.Policy;
import com.smartcourier.policy.repository.PolicyRepository;
import com.smartcourier.policy.service.PolicyService;
import com.smartcourier.policy.service.SagaOrchestrator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PolicyServiceIntegrationTest {

    @Autowired
    private PolicyService policyService;

    @Autowired
    private PolicyRepository policyRepository;

    @MockBean
    private SagaOrchestrator sagaOrchestrator;

    @MockBean
    private org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;



    @BeforeEach
    void setUp() {
        policyRepository.deleteAll();
    }

    @Test
    void createAndGetPolicies_FullFlow_Success() {
        // 1. Create Policy
        PolicyRequest request = new PolicyRequest();
        request.setName("Health Guard");
        request.setDescription("Comprehensive health insurance");
        request.setType("HEALTH");
        request.setBasePremium(BigDecimal.valueOf(1200));

        PolicyResponse response = policyService.createPolicy(request);
        assertNotNull(response.getId());
        assertEquals("Health Guard", response.getName());

        // 2. Get All Policies
        List<PolicyResponse> policies = policyService.getPolicies();
        assertFalse(policies.isEmpty());
        assertTrue(policies.stream().anyMatch(p -> p.getName().equals("Health Guard")));
    }

    @Test
    void purchasePolicy_Success() {
        // 1. Create Policy to purchase
        Policy policy = Policy.builder()
                .name("Accident Shield")
                .description("Coverage for accidents")
                .type("ACCIDENT")
                .status("ACTIVE")
                .expiryDate(java.time.LocalDateTime.now().plusYears(1))
                .basePremium(BigDecimal.valueOf(500))
                .build();
        policy = policyRepository.save(policy);

        com.smartcourier.policy.entity.PolicyPurchaseSaga saga = new com.smartcourier.policy.entity.PolicyPurchaseSaga();
        saga.setId(100L);
        when(sagaOrchestrator.startPurchaseSaga(anyString(), anyLong())).thenReturn(saga);

        // 2. Purchase Policy
        String result = policyService.purchasePolicy(policy.getId(), "testUser");
        assertTrue(result.contains("Policy purchase saga initiated"));
    }
}
