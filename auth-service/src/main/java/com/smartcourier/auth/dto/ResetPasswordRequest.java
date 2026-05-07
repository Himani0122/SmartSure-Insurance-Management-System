package com.smartcourier.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request payload for resetting password using OTP")
public class ResetPasswordRequest {
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be a valid email address")
    @Schema(description = "Registered email address", example = "john@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @NotBlank(message = "OTP cannot be blank")
    @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
    @Schema(description = "6-digit OTP received via email", example = "123456", requiredMode = Schema.RequiredMode.REQUIRED)
    private String otp;

    @NotBlank(message = "New password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @Schema(description = "New password (min 8 chars, 1 uppercase, 1 digit)", example = "NewPass123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;
}
