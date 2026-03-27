package com.smartcourier.policy.messaging;

import com.smartcourier.policy.dto.SagaEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.smartcourier.policy.config.RabbitMQConfig;

@Slf4j
@Service
@RequiredArgsConstructor
public class SagaEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void sendPurchaseRequest(SagaEvent event) {
        log.info("Publishing saga purchase request to RabbitMQ: sagaId={}, policyId={}", event.getSagaId(), event.getPolicyId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.SAGA_EXCHANGE, RabbitMQConfig.ROUTING_KEY_REQUEST, event);
    }

    public void sendPurchaseResponse(SagaEvent event) {
        log.info("Publishing saga purchase response to RabbitMQ: sagaId={}, status={}", event.getSagaId(), event.getStatus());
        rabbitTemplate.convertAndSend(RabbitMQConfig.SAGA_EXCHANGE, RabbitMQConfig.ROUTING_KEY_RESPONSE, event);
    }

    public void sendCompensation(SagaEvent event) {
        log.info("Publishing saga compensation to RabbitMQ: sagaId={}, reason={}", event.getSagaId(), event.getFailureReason());
        rabbitTemplate.convertAndSend(RabbitMQConfig.SAGA_EXCHANGE, RabbitMQConfig.ROUTING_KEY_COMPENSATE, event);
    }
}
