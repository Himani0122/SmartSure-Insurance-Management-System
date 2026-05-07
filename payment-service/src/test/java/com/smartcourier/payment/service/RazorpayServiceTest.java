package com.smartcourier.payment.service;

import com.razorpay.RazorpayException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class RazorpayServiceTest {

    @InjectMocks
    private RazorpayService razorpayService;

    @BeforeEach
    void setUp() {
        org.springframework.test.util.ReflectionTestUtils.setField(razorpayService, "keyId", "rzp_test_placeholder");
        org.springframework.test.util.ReflectionTestUtils.setField(razorpayService, "keySecret", "secret_placeholder");
    }

    @Test
    void testCreateOrder_Mock() throws RazorpayException {
        // Since the client is null (no keys), it should return a mock ID
        String orderId = razorpayService.createOrder(java.math.BigDecimal.valueOf(100.0), "INR", "receipt_1");
        assertTrue(orderId.startsWith("order_mock_"));
    }

    @Test
    void testInit() throws RazorpayException {
        // Just verify it doesn't throw when placeholders are used
        razorpayService.init();
    }
    @Test
    void testCreateOrder_RealClient() throws Exception {
        com.razorpay.RazorpayClient mockClient = org.mockito.Mockito.mock(com.razorpay.RazorpayClient.class);
        mockClient.orders = org.mockito.Mockito.mock(com.razorpay.OrderClient.class);
        
        // Use reflection to set the client
        org.springframework.test.util.ReflectionTestUtils.setField(razorpayService, "client", mockClient);
        
        com.razorpay.Order mockOrder = new com.razorpay.Order(new org.json.JSONObject("{\"id\":\"order_real_123\"}"));
        org.mockito.Mockito.when(mockClient.orders.create(org.mockito.ArgumentMatchers.any(org.json.JSONObject.class))).thenReturn(mockOrder);

        String orderId = razorpayService.createOrder(java.math.BigDecimal.valueOf(150.0), "INR", "receipt_2");
        assertEquals("order_real_123", orderId);
    }
}
