package com.smartcourier.payment.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.Binding;
import static org.junit.jupiter.api.Assertions.*;

public class RabbitMQConfigTest {

    private RabbitMQConfig config = new RabbitMQConfig();

    @Test
    void testConfigBeans() {
        TopicExchange exchange = config.sagaExchange();
        assertEquals(RabbitMQConfig.SAGA_EXCHANGE, exchange.getName());

        Queue q = config.purchaseRequestQueue();
        assertEquals(RabbitMQConfig.SAGA_PURCHASE_REQUEST_QUEUE, q.getName());
        
        assertNotNull(config.jsonMessageConverter());
    }
}
