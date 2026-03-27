package com.smartcourier.policy.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Schema(description = "Request payload for creating or updating a policy")
public class PolicyRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Policy name is required")
    @Size(min = 3, max = 100, message = "Policy name must be between 3 and 100 characters")
    @Schema(description = "Name of the policy", example = "Health Shield Plus", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NotBlank(message = "Policy description is required")
    @Size(min = 10, max = 500, message = "Description must be between 10 and 500 characters")
    @Schema(description = "Detailed description of the policy", example = "Comprehensive health coverage for individuals and families", requiredMode = Schema.RequiredMode.REQUIRED)
    private String description;

    @NotNull(message = "Base premium is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Premium must be greater than zero")
    @Schema(description = "Base premium amount in INR", example = "5000.00", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal basePremium;

    @Pattern(regexp = "HEALTH|LIFE|VEHICLE|PROPERTY|OTHER", message = "Type must be one of: HEALTH, LIFE, VEHICLE, PROPERTY, OTHER")
    @Schema(description = "Policy type", example = "HEALTH", allowableValues = {"HEALTH", "LIFE", "VEHICLE", "PROPERTY", "OTHER"})
    private String type;

    @Pattern(regexp = "ACTIVE|INACTIVE|EXPIRED", message = "Status must be one of: ACTIVE, INACTIVE, EXPIRED")
    @Schema(description = "Policy status", example = "ACTIVE", allowableValues = {"ACTIVE", "INACTIVE", "EXPIRED"})
    private String status;

    @Future(message = "Expiry date must be a future date")
    @Schema(description = "Policy expiry date (must be in the future)", example = "2027-12-31T00:00:00")
    private LocalDateTime expiryDate;
}
