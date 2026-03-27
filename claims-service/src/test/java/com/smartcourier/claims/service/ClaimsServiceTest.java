package com.smartcourier.claims.service;

import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.entity.Claim;
import com.smartcourier.claims.repository.ClaimRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClaimsServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private FileStorageUtil fileStorageUtil;

    @Mock
    private OutboxService outboxService;

    @InjectMocks
    private ClaimsService claimsService;

    private Claim testClaim;
    private ClaimInitiateRequest testRequest;

    @BeforeEach
    void setUp() {
        testClaim = Claim.builder()
                .id(1L)
                .policyId(10L)
                .username("testusr")
                .description("Test Description")
                .idempotencyKey("uid-1234")
                .status("PENDING")
                .build();

        testRequest = new ClaimInitiateRequest();
        testRequest.setPolicyId(10L);
        testRequest.setDescription("Test Description");
        testRequest.setIdempotencyKey("uid-1234");
    }

    @Test
    void uploadDocument_ShouldReturnPath() {
        MultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
        when(fileStorageUtil.storeFile(file, "testusr")).thenReturn("/tmp/uploads/test.txt");

        String path = claimsService.uploadDocument(file, "testusr");

        assertEquals("/tmp/uploads/test.txt", path);
        verify(fileStorageUtil, times(1)).storeFile(file, "testusr");
    }

    @Test
    void initiateClaim_WhenNewClaim_ShouldSaveAndReturnResponse() {
        when(claimRepository.findByIdempotencyKey("uid-1234")).thenReturn(Optional.empty());
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        ClaimResponse response = claimsService.initiateClaim(testRequest, "testusr");

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("PENDING", response.getStatus());
        verify(claimRepository, times(1)).findByIdempotencyKey("uid-1234");
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    void initiateClaim_WhenIdempotentExists_ShouldReturnExistingResponse() {
        when(claimRepository.findByIdempotencyKey("uid-1234")).thenReturn(Optional.of(testClaim));

        ClaimResponse response = claimsService.initiateClaim(testRequest, "testusr");

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(claimRepository, times(1)).findByIdempotencyKey("uid-1234");
        verify(claimRepository, never()).save(any(Claim.class));
    }

    @Test
    void updateClaimStatus_WhenExists_ShouldSave() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));

        claimsService.updateClaimStatus(1L, "APPROVED");

        assertEquals("APPROVED", testClaim.getStatus());
        verify(claimRepository, times(1)).findById(1L);
        verify(claimRepository, times(1)).save(testClaim);
    }

    @Test
    void trackClaim_WhenFound_ShouldReturnResponse() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        ClaimResponse response = claimsService.trackClaim(1L);
        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void trackClaim_WhenNotFound_ShouldThrowException() {
        when(claimRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> claimsService.trackClaim(1L));
    }

    @Test
    void getAllClaims_ShouldReturnList() {
        when(claimRepository.findAll()).thenReturn(List.of(testClaim));
        List<ClaimResponse> result = claimsService.getAllClaims();
        assertEquals(1, result.size());
    }

    @Test
    void submitClaim_Success() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);
        ClaimResponse result = claimsService.submitClaim(1L, "testusr");
        assertEquals("PENDING", result.getStatus());
    }

    @Test
    void cancelClaim_Success() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);
        ClaimResponse result = claimsService.cancelClaim(1L, "testusr");
        assertEquals("CANCELLED", result.getStatus());
    }

    @Test
    void addDocument_Success() {
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "pdf content".getBytes());
        testClaim.setDocuments(new java.util.ArrayList<>());
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(fileStorageUtil.storeFile(any(), anyString())).thenReturn("url");
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        ClaimResponse result = claimsService.addDocument(1L, file, "testusr");

        assertNotNull(result);
        verify(claimRepository, times(1)).save(testClaim);
    }

    @Test
    void getUserClaims_ShouldReturnList() {
        when(claimRepository.findByUsername("testusr")).thenReturn(List.of(testClaim));
        List<ClaimResponse> result = claimsService.getUserClaims("testusr");
        assertEquals(1, result.size());
    }

    @Test
    void deleteDocument_Success() {
        testClaim.setDocuments(new java.util.ArrayList<>());
        com.smartcourier.claims.entity.ClaimDocument doc = new com.smartcourier.claims.entity.ClaimDocument();
        doc.setId(100L);
        testClaim.getDocuments().add(doc);
        
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        
        claimsService.deleteDocument(1L, 100L, "testusr");
        
        assertTrue(testClaim.getDocuments().isEmpty());
    }

    @Test
    void submitClaim_WhenUnauthorized_ShouldThrowException() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        assertThrows(RuntimeException.class, () -> claimsService.submitClaim(1L, "wronguser"));
    }

    @Test
    void getPendingClaims_ShouldReturnList() {
        when(claimRepository.findByStatus("PENDING")).thenReturn(List.of(testClaim));
        List<ClaimResponse> result = claimsService.getPendingClaims();
        assertEquals(1, result.size());
    }

    @Test
    void getClaimsByStatus_ShouldReturnList() {
        when(claimRepository.findByStatus("APPROVED")).thenReturn(List.of(testClaim));
        List<ClaimResponse> result = claimsService.getClaimsByStatus("APPROVED");
        assertEquals(1, result.size());
    }

    @Test
    void cancelClaim_WhenUnauthorized_ShouldThrowException() {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        assertThrows(RuntimeException.class, () -> claimsService.cancelClaim(1L, "wronguser"));
    }
}
