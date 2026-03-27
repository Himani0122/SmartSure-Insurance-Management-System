package com.smartcourier.claims.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.service.ClaimsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ClaimsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClaimsService claimsService;

    @Autowired
    private ObjectMapper objectMapper;

    private ClaimResponse testResponse;

    @BeforeEach
    void setUp() {
        testResponse = ClaimResponse.builder()
                .id(1L)
                .status("PENDING")
                .username("testusr")
                .build();
    }

    @Test
    void getAllClaims_ShouldReturnList() throws Exception {
        when(claimsService.getAllClaims()).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/claims")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void initiateClaim_ShouldReturnCreated() throws Exception {
        ClaimInitiateRequest request = new ClaimInitiateRequest();
        request.setPolicyId(1L);
        request.setDescription("Hospitalization claim for surgery in March 2026"); // Fixed: 10+ chars
        request.setIdempotencyKey("CLAIM-20260327-001"); // Fixed: 5+ chars

        when(claimsService.initiateClaim(any(), anyString())).thenReturn(testResponse);

        mockMvc.perform(post("/api/v1/claims/initiate-claim")
                        .header("X-Username", "testusr")
                        .header("X-Role", "USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getPendingClaims_ShouldReturnList() throws Exception {
        when(claimsService.getPendingClaims()).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/claims/pending")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void getUserClaims_ShouldReturnList() throws Exception {
        when(claimsService.getUserClaims("testusr")).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/claims/user")
                        .header("X-Username", "testusr")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("testusr"));
    }

    @Test
    void submitClaim_ShouldReturnOk() throws Exception {
        when(claimsService.submitClaim(anyLong(), anyString())).thenReturn(testResponse);

        mockMvc.perform(put("/api/v1/claims/1/submit")
                        .header("X-Username", "testusr")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk());
    }

    @Test
    void cancelClaim_ShouldReturnOk() throws Exception {
        when(claimsService.cancelClaim(anyLong(), anyString())).thenReturn(testResponse);

        mockMvc.perform(put("/api/v1/claims/1/cancel")
                        .header("X-Username", "testusr")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteDocument_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/claims/1/documents/1")
                        .header("X-Username", "testusr")
                        .header("X-Role", "USER"))
                .andExpect(status().isNoContent());
    }

    @Test
    void getClaimById_ShouldReturnClaim() throws Exception {
        when(claimsService.trackClaim(1L)).thenReturn(testResponse);

        mockMvc.perform(get("/api/v1/claims/1")
                        .header("X-Username", "testusr")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getClaimsByStatus_ShouldReturnList() throws Exception {
        when(claimsService.getClaimsByStatus("SUBMITTED")).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/claims/status/SUBMITTED")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
