package com.smartcourier.payment.messaging;

import com.smartcourier.payment.dto.SagaEvent;
import com.smartcourier.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentSagaConsumerTest {

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentSagaConsumer consumer;

    @Test
    void testHandlePaymentRequest() {
        SagaEvent event = SagaEvent.builder().eventType("POLICY_RESERVED").sagaId(1L).build();
        consumer.handlePaymentRequest(event);
        verify(paymentService).processPaymentRequest(event);
    }

    @Test
    void testHandlePaymentRequest_Ignored() {
        SagaEvent event = SagaEvent.builder().eventType("OTHER").sagaId(1L).build();
        consumer.handlePaymentRequest(event);
        verify(paymentService, never()).processPaymentRequest(any());
    }
}
