package com.smartcourier.payment.repository;

import com.smartcourier.payment.entity.Payment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
public class PaymentRepositoryTest {

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    void testSaveAndFindBySagaId() {
        Payment payment = Payment.builder()
                .sagaId(1L)
                .amount(java.math.BigDecimal.valueOf(1000.0))
                .status("PENDING")
                .build();
        paymentRepository.save(payment);

        Optional<Payment> found = paymentRepository.findBySagaId(1L);
        assertTrue(found.isPresent());
        assertEquals(java.math.BigDecimal.valueOf(1000.0), found.get().getAmount());
    }
}
