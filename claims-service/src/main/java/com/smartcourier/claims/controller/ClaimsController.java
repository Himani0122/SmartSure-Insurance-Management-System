package com.smartcourier.claims.controller;

import com.smartcourier.claims.dto.ClaimDocumentResponse;
import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.service.ClaimsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
@Tag(name = "Claims Management", description = "APIs for initiating, submitting, tracking, and managing insurance claims")
public class ClaimsController {

    private final ClaimsService claimsService;

    @Operation(summary = "Get all claims (Admin only)", description = "Returns a complete list of all claims in the system.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "All claims returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getAllClaims() {
        return ResponseEntity.ok(claimsService.getAllClaims());
    }

    @Operation(summary = "Get pending claims (Admin only)", description = "Returns all claims currently in PENDING status awaiting admin review.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Pending claims returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — ADMIN role required")
    })
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getPendingClaims() {
        return ResponseEntity.ok(claimsService.getPendingClaims());
    }

    @Operation(summary = "Get claims for current user", description = "Returns all claims submitted by the authenticated user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "User's claims returned"),
        @ApiResponse(responseCode = "403", description = "Access denied — USER role required")
    })
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ClaimResponse>> getUserClaims(@RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(claimsService.getUserClaims(username));
    }

    @Operation(summary = "Initiate a new claim (User only)", description = "Creates a new insurance claim in DRAFT status. Idempotency key prevents duplicate submissions.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Claim initiated successfully"),
        @ApiResponse(responseCode = "400", description = "Validation error in request body"),
        @ApiResponse(responseCode = "403", description = "Access denied — USER role required")
    })
    @PostMapping("/initiate-claim")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ClaimResponse> initiateClaim(
            @Valid @RequestBody ClaimInitiateRequest request,
            @RequestHeader("X-Username") String username) {
        return new ResponseEntity<>(claimsService.initiateClaim(request, username), HttpStatus.CREATED);
    }

    @Operation(summary = "Submit a claim (User only)", description = "Transitions a claim from DRAFT to SUBMITTED status for admin review.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Claim submitted successfully"),
        @ApiResponse(responseCode = "404", description = "Claim not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — USER role required")
    })
    @PutMapping("/{id}/submit")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ClaimResponse> submitClaim(@PathVariable Long id, @RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(claimsService.submitClaim(id, username));
    }

    @Operation(summary = "Cancel a claim (User only)", description = "Cancels a claim that has not yet been reviewed by an admin.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Claim cancelled successfully"),
        @ApiResponse(responseCode = "404", description = "Claim not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — USER role required")
    })
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ClaimResponse> cancelClaim(@PathVariable Long id, @RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(claimsService.cancelClaim(id, username));
    }

    @Operation(summary = "Upload a document to a claim (User only)", description = "Attaches a document file (PDF, PNG, JPG) to an existing claim.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Document uploaded and attached to claim"),
        @ApiResponse(responseCode = "400", description = "Invalid file"),
        @ApiResponse(responseCode = "404", description = "Claim not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — USER role required")
    })
    @PostMapping(value = "/{id}/add-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ClaimResponse> addDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-Username") String username) {
        return ResponseEntity.ok(claimsService.addDocument(id, file, username));
    }

    @Operation(summary = "Delete a document from a claim (User only)", description = "Removes an attached document from a specific claim.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Document deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Claim or document not found"),
        @ApiResponse(responseCode = "403", description = "Access denied — USER role required")
    })
    @DeleteMapping("/{id}/documents/{docId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            @PathVariable Long docId,
            @RequestHeader("X-Username") String username) {
        claimsService.deleteDocument(id, docId, username);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get claim by ID", description = "Returns full details and status of a specific claim. Accessible by both USER and ADMIN.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Claim details returned"),
        @ApiResponse(responseCode = "404", description = "Claim not found"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ClaimResponse> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(claimsService.trackClaim(id));
    }

    @Operation(summary = "Get documents for a claim", description = "Returns a list of all documents attached to a specific claim.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Document list returned"),
        @ApiResponse(responseCode = "404", description = "Claim not found")
    })
    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<ClaimDocumentResponse>> getClaimDocuments(@PathVariable Long id) {
        return ResponseEntity.ok(claimsService.trackClaim(id).getDocuments());
    }

    @Operation(summary = "Get claims by status", description = "Filters and returns all claims with the specified status (e.g. PENDING, SUBMITTED, APPROVED, REJECTED, CANCELLED).")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Filtered claims returned"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getClaimsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(claimsService.getClaimsByStatus(status));
    }
}
