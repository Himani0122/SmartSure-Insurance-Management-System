package com.smartcourier.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(description = "Request payload for user registration")
public class RegisterRequest {

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 3, max = 30, message = "Username must be between 3 and 30 characters")
    @Schema(description = "Unique username", example = "john_doe", requiredMode = Schema.RequiredMode.REQUIRED)
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[0-9]).{8,}$",
        message = "Password must be at least 8 characters with at least one uppercase letter and one digit"
    )
    @Schema(description = "Password (min 8 chars, 1 uppercase, 1 digit)", example = "Admin@123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email must be a valid email address")
    @Pattern(
        regexp = "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
        message = "Email must follow the format: abc@gmail.com"
    )
    @Schema(description = "Valid email address", example = "john@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @Pattern(regexp = "USER|ADMIN", message = "Role must be either USER or ADMIN")
    @Schema(description = "User role (defaults to USER if not provided)", example = "USER", allowableValues = {"USER", "ADMIN"})
    private String role;
}
