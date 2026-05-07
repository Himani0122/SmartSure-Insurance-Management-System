package com.smartcourier.payment.messaging;

import com.smartcourier.payment.config.RabbitMQConfig;
import com.smartcourier.payment.dto.SagaEvent;
import com.smartcourier.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentSagaConsumer {

    private final PaymentService paymentService;

    @RabbitListener(queues = RabbitMQConfig.SAGA_PURCHASE_REQUEST_QUEUE)
    public void handlePaymentRequest(SagaEvent event) {
        if ("POLICY_RESERVED".equals(event.getEventType()) || "PURCHASE_REQUEST".equals(event.getEventType())) {
            log.info("Received payment trigger for sagaId: {}", event.getSagaId());
            paymentService.processPaymentRequest(event);
        }
    }
}
