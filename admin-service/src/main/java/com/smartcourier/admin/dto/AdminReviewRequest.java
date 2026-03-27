package com.smartcourier.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for an admin to review a claim")
public class AdminReviewRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Status cannot be blank")
    @Pattern(regexp = "APPROVED|REJECTED", message = "Status must be either APPROVED or REJECTED")
    @Schema(description = "Decision on the claim", example = "APPROVED", allowableValues = {"APPROVED", "REJECTED"}, requiredMode = Schema.RequiredMode.REQUIRED)
    private String status;

    @Size(max = 500, message = "Comments must not exceed 500 characters")
    @Schema(description = "Admin comments or reason for decision", example = "All documents verified, claim is valid.")
    private String comments;
}
