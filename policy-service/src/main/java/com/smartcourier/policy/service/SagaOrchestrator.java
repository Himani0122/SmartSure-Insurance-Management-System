package com.smartcourier.policy.service;

import com.smartcourier.policy.dto.SagaEvent;
import com.smartcourier.policy.entity.PolicyPurchaseSaga;
import com.smartcourier.policy.messaging.SagaEventProducer;
import com.smartcourier.policy.repository.PolicyPurchaseSagaRepository;
import com.smartcourier.policy.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class SagaOrchestrator {

    private final PolicyPurchaseSagaRepository sagaRepository;
    private final PolicyRepository policyRepository;
    private final SagaEventProducer sagaEventProducer;

    @Transactional
    public PolicyPurchaseSaga startPurchaseSaga(String userId, Long policyId) {
        // Verify policy exists
        policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + policyId));

        // Create saga record
        PolicyPurchaseSaga saga = PolicyPurchaseSaga.builder()
                .userId(userId)
                .policyId(policyId)
                .status("INITIATED")
                .createdAt(LocalDateTime.now())
                .build();
        saga = sagaRepository.save(saga);

        log.info("Saga started: sagaId={}, userId={}, policyId={}", saga.getId(), userId, policyId);

        // Publish purchase request event
        SagaEvent event = SagaEvent.builder()
                .sagaId(saga.getId())
                .eventType("PURCHASE_REQUEST")
                .policyId(policyId)
                .userId(userId)
                .status("INITIATED")
                .build();

        sagaEventProducer.sendPurchaseRequest(event);
        return saga;
    }

    @Transactional
    public void handleSagaResponse(SagaEvent event) {
        PolicyPurchaseSaga saga = sagaRepository.findById(event.getSagaId())
                .orElseThrow(() -> new RuntimeException("Saga not found: " + event.getSagaId()));

        log.info("Processing saga response: sagaId={}, currentStatus={}, eventType={}",
                saga.getId(), saga.getStatus(), event.getEventType());

        switch (event.getEventType()) {
            case "POLICY_RESERVED" -> {
                saga.setStatus("POLICY_RESERVED");
                saga.setUpdatedAt(LocalDateTime.now());
                sagaRepository.save(saga);

                // Next step: simulate payment confirmation
                SagaEvent paymentEvent = SagaEvent.builder()
                        .sagaId(saga.getId())
                        .eventType("PAYMENT_CONFIRM")
                        .policyId(saga.getPolicyId())
                        .userId(saga.getUserId())
                        .status("POLICY_RESERVED")
                        .build();
                sagaEventProducer.sendPurchaseResponse(paymentEvent);
            }
            case "PAYMENT_CONFIRM" -> {
                saga.setStatus("PAYMENT_COMPLETED");
                saga.setUpdatedAt(LocalDateTime.now());
                sagaRepository.save(saga);

                // Final step: activate policy
                SagaEvent activateEvent = SagaEvent.builder()
                        .sagaId(saga.getId())
                        .eventType("POLICY_ACTIVATE")
                        .policyId(saga.getPolicyId())
                        .userId(saga.getUserId())
                        .status("PAYMENT_COMPLETED")
                        .build();
                sagaEventProducer.sendPurchaseResponse(activateEvent);
            }
            case "POLICY_ACTIVATE" -> {
                saga.setStatus("COMPLETED");
                saga.setUpdatedAt(LocalDateTime.now());
                sagaRepository.save(saga);
                log.info("Saga completed successfully: sagaId={}", saga.getId());
            }
            default -> log.warn("Unknown saga event type: {}", event.getEventType());
        }
    }

    @Transactional
    public void handleCompensation(SagaEvent event) {
        PolicyPurchaseSaga saga = sagaRepository.findById(event.getSagaId())
                .orElseThrow(() -> new RuntimeException("Saga not found: " + event.getSagaId()));

        log.warn("Compensating saga: sagaId={}, reason={}", saga.getId(), event.getFailureReason());

        saga.setStatus("COMPENSATED");
        saga.setFailureReason(event.getFailureReason());
        saga.setUpdatedAt(LocalDateTime.now());
        sagaRepository.save(saga);

        log.info("Saga compensated: sagaId={}", saga.getId());
    }
}
