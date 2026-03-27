package com.smartcourier.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for user login")
public class LoginRequest {

    @NotBlank(message = "Username cannot be blank")
    @Schema(description = "Registered username", example = "john_doe", requiredMode = Schema.RequiredMode.REQUIRED)
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Schema(description = "Account password", example = "Admin@123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;
}
