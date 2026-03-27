package com.smartcourier.policy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SagaEvent {
    private Long sagaId;
    private String eventType; // PURCHASE_REQUEST, PAYMENT_CONFIRM, POLICY_ACTIVATE, COMPENSATE
    private Long policyId;
    private String userId;
    private String status;
    private String failureReason;
}
