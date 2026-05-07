package com.smartcourier.policy.service;

import com.smartcourier.policy.dto.SagaEvent;
import com.smartcourier.policy.entity.PolicyPurchaseSaga;
import com.smartcourier.policy.messaging.SagaEventProducer;
import com.smartcourier.policy.repository.PolicyPurchaseSagaRepository;
import com.smartcourier.policy.repository.PolicyRepository;
import com.smartcourier.policy.entity.Policy;
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
    private final com.smartcourier.policy.client.AuthClient authClient;

    @Transactional
    public PolicyPurchaseSaga startPurchaseSaga(String userId, Long policyId) {
        // Verify policy exists
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + policyId));

        java.math.BigDecimal amount = policy.getBasePremium().multiply(java.math.BigDecimal.valueOf(1.05));

        // Create saga record
        PolicyPurchaseSaga saga = PolicyPurchaseSaga.builder()
                .userId(userId)
                .policyId(policyId)
                .amount(amount)
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
                .amount(amount)
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

                // Next step: Delegate to Payment Service
                SagaEvent paymentEvent = SagaEvent.builder()
                        .sagaId(saga.getId())
                        .eventType("PAYMENT_REQUEST")
                        .policyId(saga.getPolicyId())
                        .userId(saga.getUserId())
                        .amount(saga.getAmount())
                        .status("POLICY_RESERVED")
                        .build();
                sagaEventProducer.sendPurchaseRequest(paymentEvent);
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

                // Send purchase confirmation email
                try {
                    com.smartcourier.policy.dto.external.UserResponse user = authClient.getUserByUsername(saga.getUserId());
                    Policy policy = policyRepository.findById(saga.getPolicyId()).orElse(null);
                    if (user != null && policy != null) {
                        String body = "Hello " + user.getName() + ",\n\n" +
                                "Congratulations! Your purchase of the policy \"" + policy.getName() + "\" has been successfully completed.\n" +
                                "Policy ID: " + policy.getId() + "\n" +
                                "Type: " + policy.getType() + "\n" +
                                "Expiry Date: " + policy.getExpiryDate() + "\n\n" +
                                "Thank you for choosing SmartSure!";
                        
                        authClient.sendNotification(com.smartcourier.policy.dto.external.NotificationRequest.builder()
                                .email(user.getEmail())
                                .username(user.getUsername())
                                .subject("SmartSure - Policy Purchase Confirmation")
                                .message(body)
                                .build());
                        log.info("Purchase confirmation email sent to: {}", user.getEmail());
                    }
                } catch (Exception e) {
                    log.error("Failed to send purchase confirmation email for saga {}: {}", saga.getId(), e.getMessage());
                }
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
