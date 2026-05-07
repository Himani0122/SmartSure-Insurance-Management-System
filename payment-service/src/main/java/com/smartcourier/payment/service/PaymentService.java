package com.smartcourier.payment.service;

import com.smartcourier.payment.dto.SagaEvent;
import com.smartcourier.payment.entity.Payment;
import com.smartcourier.payment.messaging.PaymentSagaProducer;
import com.smartcourier.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayService razorpayService;
    private final PaymentSagaProducer sagaProducer;

    @Transactional
    public void processPaymentRequest(SagaEvent event) {
        log.info("Processing payment request for sagaId: {}", event.getSagaId());

        try {
            // 1. Create a pending payment record
            Payment payment = Payment.builder()
                    .sagaId(event.getSagaId())
                    .userId(event.getUserId())
                    .policyId(event.getPolicyId())
                    .amount(event.getAmount()) 
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .build();

            // 2. Create Razorpay Order
            String orderId = razorpayService.createOrder(payment.getAmount(), "INR", "receipt_" + event.getSagaId());
            payment.setRazorpayOrderId(orderId);
            paymentRepository.save(payment);

            log.info("Razorpay order created: {} for sagaId: {}", orderId, event.getSagaId());

            
            confirmPayment(event.getSagaId(), "pay_mock_" + System.currentTimeMillis());

        } catch (Exception e) {
            log.error("Payment failed for sagaId: {}", event.getSagaId(), e);
            event.setEventType("PAYMENT_FAILED");
            event.setFailureReason(e.getMessage());
            sagaProducer.sendCompensate(event);
        }
    }

    @Transactional
    public void confirmPayment(Long sagaId, String paymentId) {
        Payment payment = paymentRepository.findBySagaId(sagaId)
                .orElseThrow(() -> new RuntimeException("Payment not found for sagaId: " + sagaId));

        payment.setRazorpayPaymentId(paymentId);
        payment.setStatus("SUCCESS");
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        log.info("Payment confirmed for sagaId: {}", sagaId);

        // Notify Orchestrator
        SagaEvent responseEvent = SagaEvent.builder()
                .sagaId(sagaId)
                .eventType("PAYMENT_CONFIRM")
                .status("SUCCESS")
                .build();
        sagaProducer.sendResponse(responseEvent);
    }
}
