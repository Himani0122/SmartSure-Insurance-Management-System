package com.smartcourier.policy.messaging;

import com.smartcourier.policy.dto.SagaEvent;
import com.smartcourier.policy.service.SagaOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.smartcourier.policy.config.RabbitMQConfig;

@Slf4j
@Component
@RequiredArgsConstructor
public class SagaEventConsumer {

    private final SagaOrchestrator sagaOrchestrator;

    @RabbitListener(queues = RabbitMQConfig.SAGA_PURCHASE_RESPONSE_QUEUE)
    public void handlePurchaseResponse(SagaEvent event) {
        log.info("Received saga response from RabbitMQ: sagaId={}, eventType={}, status={}",
                event.getSagaId(), event.getEventType(), event.getStatus());

        sagaOrchestrator.handleSagaResponse(event);
    }

    @RabbitListener(queues = RabbitMQConfig.SAGA_PURCHASE_COMPENSATE_QUEUE)
    public void handleCompensation(SagaEvent event) {
        log.info("Received saga compensation from RabbitMQ: sagaId={}, reason={}",
                event.getSagaId(), event.getFailureReason());

        sagaOrchestrator.handleCompensation(event);
    }
}
