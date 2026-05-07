package com.smartcourier.payment.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

public class PaymentEntityTest {
    @Test
    void testPaymentEntity() {
        LocalDateTime now = LocalDateTime.now();
        Payment p = Payment.builder()
                .id(1L)
                .amount(java.math.BigDecimal.valueOf(100.0))
                .status("SUCCESS")
                .createdAt(now)
                .build();
        
        assertEquals(1L, p.getId());
        assertEquals(java.math.BigDecimal.valueOf(100.0), p.getAmount());
        assertEquals("SUCCESS", p.getStatus());
        assertEquals(now, p.getCreatedAt());
        
        p.setStatus("FAILED");
        assertEquals("FAILED", p.getStatus());
    }
}
