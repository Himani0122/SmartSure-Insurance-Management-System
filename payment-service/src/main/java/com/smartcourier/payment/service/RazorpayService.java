package com.smartcourier.payment.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient client;

    @PostConstruct
    public void init() throws RazorpayException {
        if (!keyId.contains("placeholder")) {
            this.client = new RazorpayClient(keyId, keySecret);
        }
    }

    public String createOrder(java.math.BigDecimal amount, String currency, String receipt) throws RazorpayException {
        if (client == null) {
            log.warn("Razorpay client not initialized, using mock order ID");
            return "order_mock_" + System.currentTimeMillis();
        }

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amount.multiply(java.math.BigDecimal.valueOf(100)).intValue()); // amount in the smallest currency unit
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", receipt);

        Order order = client.orders.create(orderRequest);
        return order.get("id");
    }
}
