package com.smartcourier.claims.messaging;

import com.smartcourier.claims.dto.ClaimStatusUpdateEvent;
import com.smartcourier.claims.service.ClaimsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimMessageConsumer {

    private final ClaimsService claimsService;

    @RabbitListener(queues = "claim.status.queue")
    public void handleStatusUpdate(ClaimStatusUpdateEvent event) {
        log.info("Received claim status update from RabbitMQ: claimId={}, newStatus={}", 
                event.getClaimId(), event.getStatus());
        
        try {
            claimsService.updateClaimStatus(event.getClaimId(), event.getStatus());
            log.info("Successfully updated claim status in database for claimId={}", event.getClaimId());
        } catch (Exception e) {
            log.error("Failed to update claim status for claimId={}: {}", event.getClaimId(), e.getMessage());
            // In a real system, you might send to a Dead Letter Queue (DLQ) here
        }
    }
}
