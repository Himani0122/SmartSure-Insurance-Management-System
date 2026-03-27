package com.smartcourier.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for changing password")
public class ChangePasswordRequest {

    @NotBlank(message = "Old password cannot be blank")
    @Schema(description = "Current password", example = "OldPass@1", requiredMode = Schema.RequiredMode.REQUIRED)
    private String oldPassword;

    @NotBlank(message = "New password cannot be blank")
    @Size(min = 8, message = "New password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[0-9]).{8,}$",
        message = "New password must be at least 8 characters with at least one uppercase letter and one digit"
    )
    @Schema(description = "New password (min 8 chars, 1 uppercase, 1 digit)", example = "NewPass@2", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;
}
