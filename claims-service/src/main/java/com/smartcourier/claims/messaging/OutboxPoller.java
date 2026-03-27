package com.smartcourier.claims.messaging;

import com.smartcourier.claims.entity.OutboxEvent;
import com.smartcourier.claims.repository.OutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPoller {

    private final OutboxRepository outboxRepository;
    private final RabbitTemplate rabbitTemplate;

    public static final String EXCHANGE = "claim.exchange";

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void pollAndPublish() {
        List<OutboxEvent> pendingEvents = outboxRepository.findByStatus("PENDING");

        for (OutboxEvent event : pendingEvents) {
            try {
                String routingKey = resolveRoutingKey(event.getEventType());
                
                // RabbitMQ uses Exchange and Routing Key
                rabbitTemplate.convertAndSend(EXCHANGE, routingKey, event.getPayload());

                event.setStatus("PUBLISHED");
                event.setPublishedAt(LocalDateTime.now());
                outboxRepository.save(event);

                log.info("Published outbox event to RabbitMQ: id={}, type={}, exchange={}",
                        event.getId(), event.getEventType(), EXCHANGE);
            } catch (Exception e) {
                log.error("Failed to publish outbox event id={} to RabbitMQ: {}",
                        event.getId(), e.getMessage());
            }
        }
    }

    private String resolveRoutingKey(String eventType) {
        return switch (eventType) {
            case "CLAIM_CREATED" -> "claim.created.key";
            case "CLAIM_STATUS_UPDATED" -> "claim.status.key";
            default -> "default.event.key";
        };
    }
}
