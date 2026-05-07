package com.smartcourier.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEvent {
    private String toEmail;
    private String subject;
    private String body;
    private String type; // e.g., "POLICY_PURCHASED", "CLAIM_SUBMITTED"
}
