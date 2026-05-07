package com.smartcourier.payment.service;

import com.smartcourier.payment.dto.SagaEvent;
import com.smartcourier.payment.entity.Payment;
import com.smartcourier.payment.messaging.PaymentSagaProducer;
import com.smartcourier.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RazorpayService razorpayService;

    @Mock
    private PaymentSagaProducer sagaProducer;

    @InjectMocks
    private PaymentService paymentService;

    private SagaEvent event;

    @BeforeEach
    void setUp() {
        event = SagaEvent.builder()
                .sagaId(1L)
                .userId("testUser")
                .policyId(101L)
                .eventType("PURCHASE_REQUEST")
                .amount(java.math.BigDecimal.valueOf(100.0))
                .build();
    }

    @Test
    void testProcessPaymentRequest_Success() throws Exception {
        when(razorpayService.createOrder(any(java.math.BigDecimal.class), anyString(), anyString())).thenReturn("order_123");
        when(paymentRepository.findBySagaId(anyLong())).thenReturn(Optional.of(new Payment()));
        
        paymentService.processPaymentRequest(event);

        verify(paymentRepository, times(2)).save(any(Payment.class));
        verify(sagaProducer).sendResponse(any(SagaEvent.class));
    }

    @Test
    void testProcessPaymentRequest_Failure() throws Exception {
        when(razorpayService.createOrder(any(java.math.BigDecimal.class), anyString(), anyString())).thenThrow(new RuntimeException("Razorpay error"));

        paymentService.processPaymentRequest(event);

        verify(sagaProducer).sendCompensate(any(SagaEvent.class));
    }

    @Test
    void testConfirmPayment_Success() {
        Payment payment = Payment.builder().sagaId(1L).status("PENDING").build();
        when(paymentRepository.findBySagaId(1L)).thenReturn(Optional.of(payment));

        paymentService.confirmPayment(1L, "pay_123");

        assertEquals("SUCCESS", payment.getStatus());
        assertEquals("pay_123", payment.getRazorpayPaymentId());
        verify(paymentRepository).save(payment);
        verify(sagaProducer).sendResponse(any(SagaEvent.class));
    }

    @Test
    void testConfirmPayment_NotFound() {
        when(paymentRepository.findBySagaId(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> paymentService.confirmPayment(1L, "pay_123"));
    }
}
