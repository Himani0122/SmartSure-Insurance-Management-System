package com.smartcourier.payment;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

public class PaymentApplicationTest {

    @Test
    void testMain() {
        // Just verify it exists
        assertNotNull(new PaymentServiceApplication());
    }
}
