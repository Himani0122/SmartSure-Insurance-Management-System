package com.smartcourier.admin.messaging;

import com.smartcourier.admin.dto.ClaimStatusUpdateEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public static final String EXCHANGE = "claim.exchange";
    public static final String ROUTING_KEY = "claim.status.key";

    public void sendClaimStatusUpdate(Long claimId, String status) {
        ClaimStatusUpdateEvent event = new ClaimStatusUpdateEvent(claimId, status);
        sendClaimStatusUpdate(event);
    }

    public void sendClaimStatusUpdate(ClaimStatusUpdateEvent event) {
        log.info("Sending claim status update to RabbitMQ: claimId={}, status={}", 
                event.getClaimId(), event.getStatus());
        
        rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, event);
    }
}