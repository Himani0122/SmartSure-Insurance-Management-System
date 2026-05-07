package com.smartcourier.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Request payload for initiating forgot password flow")
public class ForgotPasswordRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be a valid email address")
    @Schema(description = "Registered email address", example = "john@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;
}
