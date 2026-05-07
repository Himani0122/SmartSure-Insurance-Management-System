package com.smartcourier.policy.messaging;

import com.smartcourier.policy.config.RabbitMQConfig;
import com.smartcourier.policy.dto.SagaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;

/**
 * DISABLED: SagaProcessor is no longer active.
 *
 * Previously this class simulated the Payment Service by auto-confirming
 * every purchase request. Now that the real Payment Service (PaymentSagaConsumer)
 * listens on the same queue ("saga.purchase.request.queue"), this class is
 * disabled to prevent message stealing / race conditions.
 *
 * The Payment Service handles all purchase requests end-to-end.
 */
@Slf4j
// @Component  ← DISABLED: Payment Service now handles saga.purchase.request.queue
@RequiredArgsConstructor
public class SagaProcessor {

    private final SagaEventProducer sagaEventProducer;

    @RabbitListener(queues = RabbitMQConfig.SAGA_PURCHASE_REQUEST_QUEUE)
    public void processPurchaseRequest(SagaEvent event) {
        log.info("SagaProcessor: Received purchase request for sagaId={}, policyId={}", event.getSagaId(), event.getPolicyId());

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
