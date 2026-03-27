package com.smartcourier.policy.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String SAGA_EXCHANGE = "saga.exchange";
    
    public static final String SAGA_PURCHASE_REQUEST_QUEUE = "saga.purchase.request.queue";
    public static final String SAGA_PURCHASE_RESPONSE_QUEUE = "saga.purchase.response.queue";
    public static final String SAGA_PURCHASE_COMPENSATE_QUEUE = "saga.purchase.compensate.queue";

    public static final String ROUTING_KEY_REQUEST = "saga.purchase.request";
    public static final String ROUTING_KEY_RESPONSE = "saga.purchase.response";
    public static final String ROUTING_KEY_COMPENSATE = "saga.purchase.compensate";

    @Bean
    public TopicExchange sagaExchange() {
        return new TopicExchange(SAGA_EXCHANGE);
    }

    @Bean
    public Queue purchaseRequestQueue() {
        return new Queue(SAGA_PURCHASE_REQUEST_QUEUE, true);
    }

    @Bean
    public Queue purchaseResponseQueue() {
        return new Queue(SAGA_PURCHASE_RESPONSE_QUEUE, true);
    }

    @Bean
    public Queue purchaseCompensateQueue() {
        return new Queue(SAGA_PURCHASE_COMPENSATE_QUEUE, true);
    }

    @Bean
    public Binding requestBinding(Queue purchaseRequestQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(purchaseRequestQueue).to(sagaExchange).with(ROUTING_KEY_REQUEST);
    }

    @Bean
    public Binding responseBinding(Queue purchaseResponseQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(purchaseResponseQueue).to(sagaExchange).with(ROUTING_KEY_RESPONSE);
    }

    @Bean
    public Binding compensateBinding(Queue purchaseCompensateQueue, TopicExchange sagaExchange) {
        return BindingBuilder.bind(purchaseCompensateQueue).to(sagaExchange).with(ROUTING_KEY_COMPENSATE);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
