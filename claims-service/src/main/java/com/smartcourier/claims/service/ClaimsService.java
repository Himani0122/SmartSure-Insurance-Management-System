package com.smartcourier.claims.service;

import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.entity.Claim;
import com.smartcourier.claims.entity.ClaimDocument;
import com.smartcourier.claims.repository.ClaimRepository;
import com.smartcourier.claims.dto.ClaimDocumentResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimsService {

    private final ClaimRepository claimRepository;
    private final FileStorageUtil fileStorageUtil;
    private final OutboxService outboxService;
    private final com.smartcourier.claims.client.AuthClient authClient;

    public String uploadDocument(MultipartFile file, String username) {
        return fileStorageUtil.storeFile(file, username);
    }

    @Transactional
    public ClaimResponse initiateClaim(ClaimInitiateRequest request, String username) {
        // Idempotency Check
        Optional<Claim> existingClaim = claimRepository.findByIdempotencyKey(request.getIdempotencyKey());
        if (existingClaim.isPresent()) {
            return mapToResponse(existingClaim.get());
        }

        Claim claim = Claim.builder()
                .username(username)
                .policyId(request.getPolicyId())
                .description(request.getDescription())
                .idempotencyKey(request.getIdempotencyKey())
                .documentPath(request.getDocumentPath())
                .status("DRAFT")
                .claimAmount(request.getClaimAmount())
                .build();

        Claim saved = claimRepository.save(claim);

        // Save outbox event in the same transaction
        outboxService.saveEvent(
                "Claim",
                String.valueOf(saved.getId()),
                "CLAIM_CREATED",
                Map.of(
                        "claimId", saved.getId(),
                        "policyId", saved.getPolicyId(),
                        "username", saved.getUsername(),
                        "status", saved.getStatus()
                )
        );

        log.info("Claim created with outbox event: claimId={}", saved.getId());

        // Send email notification
        try {
            com.smartcourier.claims.dto.external.UserResponse user = authClient.getUserByUsername(username);
            if (user != null) {
                authClient.sendNotification(com.smartcourier.claims.dto.external.NotificationRequest.builder()
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .subject("SmartSure - Claim Initiated")
                        .message("Hello " + user.getName() + ",\n\nYour claim for Policy ID " + saved.getPolicyId() + " has been initiated successfully.\nClaim ID: " + saved.getId() + "\nStatus: " + saved.getStatus())
                        .build());
            }

            // Notify Admin
            authClient.sendNotification(com.smartcourier.claims.dto.external.NotificationRequest.builder()
                    .email("admin@smartsure.com")
                    .username("admin")
                    .subject("SmartSure - New Claim Initiated")
                    .message("A new claim (ID: " + saved.getId() + ") has been initiated by user " + username + " for Policy ID " + saved.getPolicyId() + ".")
                    .build());
        } catch (Exception e) {
            log.error("Failed to send claim initiation email: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    public ClaimResponse trackClaim(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        return mapToResponse(claim);
    }
    
    public void updateClaimStatus(Long id, String status, String comments) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        claim.setStatus(status);
        claim.setAdminComments(comments);
        claimRepository.save(claim);

        // Send email notification for admin response
        try {
            com.smartcourier.claims.dto.external.UserResponse user = authClient.getUserByUsername(claim.getUsername());
            if (user != null) {
                authClient.sendNotification(com.smartcourier.claims.dto.external.NotificationRequest.builder()
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .subject("SmartSure - Claim Status Updated")
                        .message("Hello " + user.getName() + ",\n\nYour claim (ID: " + claim.getId() + ") has been updated by the administrator.\nNew Status: " + status)
                        .build());
            }
        } catch (Exception e) {
            log.error("Failed to send claim status update email: {}", e.getMessage());
        }
    }

    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ClaimResponse> getPendingClaims() {
        return claimRepository.findByStatus("UNDER_REVIEW").stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ClaimResponse> getUserClaims(String username) {
        return claimRepository.findByUsername(username).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ClaimResponse submitClaim(Long id, String username) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        if (!claim.getUsername().equals(username)) throw new RuntimeException("Unauthorized");
        claim.setStatus("SUBMITTED");
        Claim saved = claimRepository.save(claim);

        // Notify Admin
        try {
            authClient.sendNotification(com.smartcourier.claims.dto.external.NotificationRequest.builder()
                    .email("admin@smartsure.com")
                    .username("admin")
                    .subject("SmartSure - Claim Submitted for Review")
                    .message("Claim ID " + saved.getId() + " has been SUBMITTED by " + username + " and is ready for admin review.")
                    .build());
        } catch (Exception e) {
            log.error("Failed to send admin notification for submitted claim: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public ClaimResponse cancelClaim(Long id, String username) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        if (!claim.getUsername().equals(username)) throw new RuntimeException("Unauthorized");
        claim.setStatus("CANCELLED");
        return mapToResponse(claimRepository.save(claim));
    }

    @Transactional
    public ClaimResponse addDocument(Long id, MultipartFile file, String username) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + id));
        if (!claim.getUsername().equals(username)) throw new RuntimeException("Unauthorized");
        
        String url = fileStorageUtil.storeFile(file, username);
        ClaimDocument doc = ClaimDocument.builder()
                .claim(claim)
                .filename(file.getOriginalFilename())
                .fileUrl(url)
                .uploadedAt(LocalDateTime.now())
                .build();
        
        claim.getDocuments().add(doc);
        Claim saved = claimRepository.save(claim);

        // Send email notification for document upload
        try {
            com.smartcourier.claims.dto.external.UserResponse user = authClient.getUserByUsername(username);
            if (user != null) {
                authClient.sendNotification(com.smartcourier.claims.dto.external.NotificationRequest.builder()
                        .email(user.getEmail())
                        .subject("SmartSure - Document Uploaded")
                        .message("Hello " + user.getName() + ",\n\nA new document \"" + file.getOriginalFilename() + "\" has been uploaded to your claim (ID: " + claim.getId() + ").")
                        .build());
            }
        } catch (Exception e) {
            log.error("Failed to send document upload email: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteDocument(Long claimId, Long docId, String username) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + claimId));
        if (!claim.getUsername().equals(username)) throw new RuntimeException("Unauthorized");
        
        claim.getDocuments().removeIf(doc -> doc.getId().equals(docId));
        claimRepository.save(claim);
    }

    public org.springframework.core.io.Resource downloadDocument(Long claimId, Long docId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found with id: " + claimId));
        
        ClaimDocument document = claim.getDocuments().stream()
                .filter(doc -> doc.getId().equals(docId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        return fileStorageUtil.loadFileAsResource(document.getFileUrl());
    }

    public List<ClaimResponse> getClaimsByStatus(String status) {
        return claimRepository.findByStatus(status).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private ClaimResponse mapToResponse(Claim claim) {
        return ClaimResponse.builder()
                .id(claim.getId())
                .policyId(claim.getPolicyId())
                .username(claim.getUsername())
                .description(claim.getDescription())
                .status(claim.getStatus())
                .idempotencyKey(claim.getIdempotencyKey())
                .documentPath(claim.getDocumentPath())
                .adminComments(claim.getAdminComments())
                .claimAmount(claim.getClaimAmount())
                .documents(claim.getDocuments() != null ? claim.getDocuments().stream().map(this::mapToDocResponse).collect(Collectors.toList()) : null)
                .build();
    }

    private ClaimDocumentResponse mapToDocResponse(ClaimDocument doc) {
        return ClaimDocumentResponse.builder()
                .id(doc.getId())
                .filename(doc.getFilename())
                .fileUrl(doc.getFileUrl())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
