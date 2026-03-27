package com.smartcourier.policy.service;

import com.smartcourier.policy.dto.SagaEvent;
import com.smartcourier.policy.entity.Policy;
import com.smartcourier.policy.entity.PolicyPurchaseSaga;
import com.smartcourier.policy.messaging.SagaEventProducer;
import com.smartcourier.policy.repository.PolicyPurchaseSagaRepository;
import com.smartcourier.policy.repository.PolicyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SagaOrchestratorTest {

    @Mock
    private PolicyPurchaseSagaRepository sagaRepository;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private SagaEventProducer sagaEventProducer;

    @InjectMocks
    private SagaOrchestrator sagaOrchestrator;

    private Policy testPolicy;
    private PolicyPurchaseSaga testSaga;

    @BeforeEach
    void setUp() {
        testPolicy = new Policy();
        testPolicy.setId(1L);
        testPolicy.setName("Test Policy");

        testSaga = new PolicyPurchaseSaga();
        testSaga.setId(100L);
        testSaga.setPolicyId(1L);
        testSaga.setUserId("user1");
        testSaga.setStatus("INITIATED");
    }

    @Test
    void startPurchaseSaga_ShouldReturnSaga() {
        when(policyRepository.findById(1L)).thenReturn(Optional.of(testPolicy));
        when(sagaRepository.save(any(PolicyPurchaseSaga.class))).thenReturn(testSaga);

        PolicyPurchaseSaga result = sagaOrchestrator.startPurchaseSaga("user1", 1L);

        assertNotNull(result);
        assertEquals("INITIATED", result.getStatus());
        verify(sagaEventProducer, times(1)).sendPurchaseRequest(any(SagaEvent.class));
    }

    @Test
    void handleSagaResponse_PolicyReserved() {
        SagaEvent event = SagaEvent.builder()
                .sagaId(100L)
                .eventType("POLICY_RESERVED")
                .build();

        when(sagaRepository.findById(100L)).thenReturn(Optional.of(testSaga));

        sagaOrchestrator.handleSagaResponse(event);

        assertEquals("POLICY_RESERVED", testSaga.getStatus());
        verify(sagaEventProducer, times(1)).sendPurchaseResponse(any(SagaEvent.class));
    }

    @Test
    void handleSagaResponse_PaymentConfirm() {
        SagaEvent event = SagaEvent.builder()
                .sagaId(100L)
                .eventType("PAYMENT_CONFIRM")
                .build();

        when(sagaRepository.findById(100L)).thenReturn(Optional.of(testSaga));

        sagaOrchestrator.handleSagaResponse(event);

        assertEquals("PAYMENT_COMPLETED", testSaga.getStatus());
        verify(sagaEventProducer, times(1)).sendPurchaseResponse(any(SagaEvent.class));
    }

    @Test
    void handleSagaResponse_PolicyActivate() {
        SagaEvent event = SagaEvent.builder()
                .sagaId(100L)
                .eventType("POLICY_ACTIVATE")
                .build();

        when(sagaRepository.findById(100L)).thenReturn(Optional.of(testSaga));

        sagaOrchestrator.handleSagaResponse(event);

        assertEquals("COMPLETED", testSaga.getStatus());
    }

    @Test
    void handleCompensation_ShouldSetCompensated() {
        SagaEvent event = SagaEvent.builder()
                .sagaId(100L)
                .failureReason("Payment Failed")
                .build();

        when(sagaRepository.findById(100L)).thenReturn(Optional.of(testSaga));

        sagaOrchestrator.handleCompensation(event);

        assertEquals("COMPENSATED", testSaga.getStatus());
        assertEquals("Payment Failed", testSaga.getFailureReason());
    }
}
