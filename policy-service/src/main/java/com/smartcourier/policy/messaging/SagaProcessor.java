package com.smartcourier.policy.messaging;

import com.smartcourier.policy.config.RabbitMQConfig;
import com.smartcourier.policy.dto.SagaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SagaProcessor {

    private final SagaEventProducer sagaEventProducer;

    @RabbitListener(queues = RabbitMQConfig.SAGA_PURCHASE_REQUEST_QUEUE)
    public void processPurchaseRequest(SagaEvent event) {
        log.info("SagaProcessor: Received purchase request for sagaId={}, policyId={}", event.getSagaId(), event.getPolicyId());

        // Simulate successful policy reservation and forward to the response queue
        SagaEvent responseEvent = SagaEvent.builder()
                .sagaId(event.getSagaId())
                .eventType("POLICY_RESERVED")
                .policyId(event.getPolicyId())
                .userId(event.getUserId())
                .status("POLICY_RESERVED")
                .build();

        log.info("SagaProcessor: Auto-confirming policy reservation for sagaId={}", event.getSagaId());
        sagaEventProducer.sendPurchaseResponse(responseEvent);
    }
}
