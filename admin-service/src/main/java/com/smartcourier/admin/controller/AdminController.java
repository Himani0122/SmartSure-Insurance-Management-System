package com.smartcourier.admin.controller;

import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.service.AdminService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Operations", description = "APIs for admin claim management, user management, and system reporting — ADMIN role required for all endpoints")
public class AdminController {

    private final AdminService adminService;

    // ===== CLAIM MANAGEMENT =====

    @Operation(summary = "Review a claim", description = "Submit a formal review decision (APPROVED or REJECTED) with optional comments for a specific claim.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Claim reviewed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid status — must be APPROVED or REJECTED"),
        @ApiResponse(responseCode = "404", description = "Claim not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @PostMapping("/claims/{id}/review")
    public ResponseEntity<String> reviewClaim(@PathVariable Long id, @Valid @RequestBody AdminReviewRequest request) {
        return new ResponseEntity<>(adminService.reviewClaim(id, request), HttpStatus.OK);
    }

    @Operation(summary = "Get all claims", description = "Returns all insurance claims in the system across all users.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "All claims returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping("/claims")
    public ResponseEntity<List<ClaimResponse>> getAllClaims() {
        return ResponseEntity.ok(adminService.getAllClaims());
    }

    @Operation(summary = "Get pending claims", description = "Returns all claims awaiting admin review in PENDING status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pending claims returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping("/claims/pending")
    public ResponseEntity<List<ClaimResponse>> getPendingClaims() {
        return ResponseEntity.ok(adminService.getPendingClaims());
    }

    @Operation(summary = "Get a claim by ID", description = "Returns full details of a specific claim by its ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Claim details returned"),
        @ApiResponse(responseCode = "404", description = "Claim not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping("/claims/{id}")
    public ResponseEntity<ClaimResponse> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getClaimById(id));
    }

    @Operation(summary = "Approve a claim", description = "Approves a claim and notifies the user via RabbitMQ event.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Claim approved successfully"),
        @ApiResponse(responseCode = "404", description = "Claim not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @PostMapping("/claims/{id}/approve")
    public ResponseEntity<String> approveClaim(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveClaim(id));
    }

    @Operation(summary = "Reject a claim", description = "Rejects a claim and notifies the user via RabbitMQ event.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Claim rejected successfully"),
        @ApiResponse(responseCode = "404", description = "Claim not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @PostMapping("/claims/{id}/reject")
    public ResponseEntity<String> rejectClaim(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.rejectClaim(id));
    }

    // ===== USER MANAGEMENT =====

    @Operation(summary = "Get all users", description = "Returns a list of all registered users via Feign call to auth-service.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User list returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @Operation(summary = "Block a user", description = "Blocks a user account by ID, preventing them from logging in. Uses Feign to contact auth-service.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User blocked successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @PutMapping("/users/{id}/block")
    public ResponseEntity<String> blockUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.blockUser(id));
    }

    @Operation(summary = "Activate a user", description = "Unblocks a previously blocked user, restoring their access.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User activated successfully"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @PutMapping("/users/{id}/activate")
    public ResponseEntity<String> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.activateUser(id));
    }

    // ===== REPORTS =====

    @Operation(summary = "Get general system report", description = "Returns an overview report with claim counts, approval rates, and system statistics.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Report data returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getGeneralReport() {
        return ResponseEntity.ok(adminService.getGeneralReport());
    }

    @Operation(summary = "Get claims report", description = "Returns a detailed list of all claims for reporting purposes.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Claims report returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping("/reports/claims")
    public ResponseEntity<List<ClaimResponse>> getClaimsReport() {
        return ResponseEntity.ok(adminService.getClaimsReport());
    }

    @Operation(summary = "Get policies report", description = "Returns a summary of all policies with key statistics.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Policies report returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping("/reports/policies")
    public ResponseEntity<List<Map<String, Object>>> getPoliciesReport() {
        return ResponseEntity.ok(adminService.getPoliciesReport());
    }
}
