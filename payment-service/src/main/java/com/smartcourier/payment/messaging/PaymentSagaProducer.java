package com.smartcourier.payment.messaging;

import com.smartcourier.payment.config.RabbitMQConfig;
import com.smartcourier.payment.dto.SagaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentSagaProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendResponse(SagaEvent event) {
        log.info("Sending saga response: sagaId={}, eventType={}", event.getSagaId(), event.getEventType());
        rabbitTemplate.convertAndSend(RabbitMQConfig.SAGA_EXCHANGE, RabbitMQConfig.ROUTING_KEY_RESPONSE, event);
    }

    public void sendCompensate(SagaEvent event) {
        log.info("Sending saga compensation: sagaId={}, reason={}", event.getSagaId(), event.getFailureReason());
        rabbitTemplate.convertAndSend(RabbitMQConfig.SAGA_EXCHANGE, RabbitMQConfig.ROUTING_KEY_COMPENSATE, event);
    }
}
