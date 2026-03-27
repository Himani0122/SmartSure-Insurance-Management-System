package com.smartcourier.claims.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String CLAIM_STATUS_QUEUE = "claim.status.queue";
    public static final String CLAIM_EXCHANGE = "claim.exchange";
    public static final String CLAIM_ROUTING_KEY = "claim.status.key";

    @Bean
    public Queue claimStatusQueue() {
        return new Queue(CLAIM_STATUS_QUEUE, true);
    }

    @Bean
    public DirectExchange claimExchange() {
        return new DirectExchange(CLAIM_EXCHANGE);
    }

    @Bean
    public Binding claimBinding(Queue claimStatusQueue, DirectExchange claimExchange) {
        return BindingBuilder.bind(claimStatusQueue).to(claimExchange).with(CLAIM_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
