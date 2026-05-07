package com.smartcourier.payment.messaging;

import com.smartcourier.payment.dto.SagaEvent;
import com.smartcourier.payment.config.RabbitMQConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class PaymentSagaProducerTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private PaymentSagaProducer producer;

    @Test
    void testSendResponse() {
        SagaEvent event = SagaEvent.builder().sagaId(1L).build();
        producer.sendResponse(event);
        verify(rabbitTemplate).convertAndSend(eq(RabbitMQConfig.SAGA_EXCHANGE), eq(RabbitMQConfig.ROUTING_KEY_RESPONSE), eq(event));
    }

    @Test
    void testSendCompensate() {
        SagaEvent event = SagaEvent.builder().sagaId(1L).failureReason("Error").build();
        producer.sendCompensate(event);
        verify(rabbitTemplate).convertAndSend(eq(RabbitMQConfig.SAGA_EXCHANGE), eq(RabbitMQConfig.ROUTING_KEY_COMPENSATE), eq(event));
    }
}
