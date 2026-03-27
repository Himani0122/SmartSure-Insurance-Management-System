package com.smartcourier.policy.controller;

import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.service.PolicyService;
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
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
@Tag(name = "Policy Management", description = "APIs for creating, viewing, purchasing, and managing insurance policies")
public class PolicyController {

    private final PolicyService policyService;

    @Operation(summary = "Search policies", description = "Search policies by name or description keyword. Accessible by USER and ADMIN.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Matching policies returned"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<PolicyResponse>> searchPolicies(@RequestParam String query) {
        return ResponseEntity.ok(policyService.searchPolicies(query));
    }

    @Operation(summary = "Get all active policies", description = "Returns policies with ACTIVE status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Active policies returned"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<PolicyResponse>> getActivePolicies() {
        return ResponseEntity.ok(policyService.getActivePolicies());
    }

    @Operation(summary = "Get all expired policies", description = "Returns policies with EXPIRED status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Expired policies returned"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/expired")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<PolicyResponse>> getExpiredPolicies() {
        return ResponseEntity.ok(policyService.getExpiredPolicies());
    }

    @Operation(summary = "Get policies purchased by the logged-in user", description = "Returns all policies the current user has purchased. USER role only.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User's policies returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — USER role required")
    })
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PolicyResponse>> getUserPurchasedPolicies(@RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(policyService.getUserPurchasedPolicies(username));
    }

    @Operation(summary = "Calculate premium for a policy", description = "Returns the calculated premium amount for the specified policy ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Premium amount returned"),
        @ApiResponse(responseCode = "404", description = "Policy not found")
    })
    @GetMapping("/premium/calculate/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BigDecimal> calculatePremium(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.calculatePremium(id));
    }

    @Operation(summary = "Get policies by type", description = "Filters policies by type (HEALTH, LIFE, VEHICLE, PROPERTY, OTHER).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Filtered policies returned"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<PolicyResponse>> getPoliciesByType(@PathVariable String type) {
        return ResponseEntity.ok(policyService.getPoliciesByType(type));
    }

    @Operation(summary = "Get policy by ID", description = "Returns full details of a specific policy.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Policy found and returned"),
        @ApiResponse(responseCode = "404", description = "Policy not found"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<PolicyResponse> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    @Operation(summary = "Create a new policy (Admin only)", description = "Creates a new insurance policy. Type must be one of: HEALTH, LIFE, VEHICLE, PROPERTY, OTHER.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Policy created successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error in request body"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyResponse> createPolicy(@Valid @RequestBody PolicyRequest request) {
        return new ResponseEntity<>(policyService.createPolicy(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Get all policies", description = "Returns the complete list of all insurance policies.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "All policies returned"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<PolicyResponse>> getPolicies() {
        return new ResponseEntity<>(policyService.getPolicies(), HttpStatus.OK);
    }

    @Operation(summary = "Purchase a policy (User only)", description = "Allows a user to purchase a policy by ID. Triggers a RabbitMQ event on success.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Policy purchased successfully"),
        @ApiResponse(responseCode = "404", description = "Policy not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — USER role required")
    })
    @PostMapping("/{id}/purchase")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> purchasePolicy(@PathVariable Long id, @RequestHeader("X-Username") String username) {
        return new ResponseEntity<>(policyService.purchasePolicy(id, username), HttpStatus.OK);
    }

    @Operation(summary = "Update a policy (Admin only)", description = "Updates an existing policy by ID. All validated fields apply.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Policy updated successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "404", description = "Policy not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyResponse> updatePolicy(@PathVariable Long id, @Valid @RequestBody PolicyRequest request) {
        return ResponseEntity.ok(policyService.updatePolicy(id, request));
    }

    @Operation(summary = "Delete a policy (Admin only)", description = "Permanently deletes a policy by ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Policy deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Policy not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Cancel a purchased policy (User only)", description = "Allows a user to cancel their own purchased policy.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Policy cancelled successfully"),
        @ApiResponse(responseCode = "404", description = "Policy not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — USER role required")
    })
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> cancelPolicy(@PathVariable Long id, @RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(policyService.cancelPolicy(id, username));
    }
}