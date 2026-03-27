package com.smartcourier.claims.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for initiating a new claim")
public class ClaimInitiateRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Policy ID is required")
    @Positive(message = "Policy ID must be a positive number")
    @Schema(description = "ID of the policy to claim against", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long policyId;

    @NotBlank(message = "Description cannot be blank")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    @Schema(description = "Detailed description of the claim reason", example = "Hospitalization due to surgery on March 2026", requiredMode = Schema.RequiredMode.REQUIRED)
    private String description;

    @NotBlank(message = "Idempotency key cannot be blank")
    @Size(min = 5, max = 64, message = "Idempotency key must be between 5 and 64 characters")
    @Schema(description = "Unique key to prevent duplicate submissions", example = "CLAIM-20260327-001", requiredMode = Schema.RequiredMode.REQUIRED)
    private String idempotencyKey;

    @Schema(description = "Optional document path for pre-uploaded files", example = "/uploads/docs/claim_doc.pdf")
    private String documentPath;
}
