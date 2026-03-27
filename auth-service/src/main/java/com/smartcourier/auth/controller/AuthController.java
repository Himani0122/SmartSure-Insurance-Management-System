package com.smartcourier.auth.controller;

import com.smartcourier.auth.dto.*;
import com.smartcourier.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user registration, login, token management, profile operations, and admin user management")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new user", description = "Creates a new user account. Role defaults to USER if not specified.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error or username/email already taken")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Login user", description = "Authenticates a user and returns a JWT access token and refresh token.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful, JWT returned"),
        @ApiResponse(responseCode = "400", description = "Invalid username or password")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Refresh JWT token", description = "Issues a new access token using a valid refresh token.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "New JWT token returned"),
        @ApiResponse(responseCode = "400", description = "Invalid or expired refresh token")
    })
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @Operation(summary = "Update user profile", description = "Allows an authenticated user to update their username and email.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PutMapping("/update-profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> updateProfile(@RequestHeader("X-Username") String username,
                                               @Valid @RequestBody UpdateProfileRequest request) {
        authService.updateProfile(username, request);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @Operation(summary = "Change password", description = "Allows an authenticated user to change their password. New password must be 8+ chars with 1 uppercase and 1 digit.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Password changed successfully"),
        @ApiResponse(responseCode = "400", description = "Old password is incorrect or new password fails validation"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PutMapping("/change-password")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> changePassword(@RequestHeader("X-Username") String username,
                                                @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(username, request);
        return ResponseEntity.ok("Password changed successfully");
    }

    @Operation(summary = "Delete a user (Admin only)", description = "Permanently deletes a user account by ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User deleted successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    @Operation(summary = "Get all users (Admin only)", description = "Returns a list of all registered users.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "List of users returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping("/all-users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @Operation(summary = "Logout user", description = "Invalidates the user's refresh token to log them out.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Logged out successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping("/logout")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<String> logout(@RequestHeader("X-Username") String username) {
        authService.logout(username);
        return ResponseEntity.ok("Logged out successfully");
    }

    @Operation(summary = "Get user by username", description = "Returns profile details of a specific user. Users can only fetch their own profile; ADMIN can fetch any.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User profile returned"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/user/{username}")
    @PreAuthorize("#username == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUser(@PathVariable String username) {
        return ResponseEntity.ok(authService.getUserByUsername(username));
    }

    @Operation(summary = "Block a user (Admin only)", description = "Blocks a user account by ID, preventing login.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User blocked successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/users/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> blockUser(@PathVariable Long id) {
        authService.blockUser(id);
        return ResponseEntity.ok("User blocked successfully");
    }

    @Operation(summary = "Activate a user (Admin only)", description = "Unblocks a previously blocked user account.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User activated successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PutMapping("/users/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> activateUser(@PathVariable Long id) {
        authService.activateUser(id);
        return ResponseEntity.ok("User activated successfully");
    }
}
