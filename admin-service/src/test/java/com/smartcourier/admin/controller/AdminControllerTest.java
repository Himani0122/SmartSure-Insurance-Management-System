package com.smartcourier.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcourier.admin.dto.AdminReviewRequest;
import com.smartcourier.admin.dto.ClaimResponse;
import com.smartcourier.admin.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @Autowired
    private ObjectMapper objectMapper;

    private AdminReviewRequest testRequest;
    private ClaimResponse testClaim;

    @BeforeEach
    void setUp() {
        testRequest = new AdminReviewRequest();
        testRequest.setStatus("APPROVED");

        testClaim = ClaimResponse.builder()
                .id(1L)
                .status("PENDING")
                .build();
    }

    @Test
    void getAllClaims_ShouldReturnList() throws Exception {
        when(adminService.getAllClaims()).thenReturn(List.of(testClaim));

        mockMvc.perform(get("/api/v1/admin/claims")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void reviewClaim_ShouldReturnSuccess() throws Exception {
        when(adminService.reviewClaim(anyLong(), any(AdminReviewRequest.class))).thenReturn("Success");

        mockMvc.perform(post("/api/v1/admin/claims/1/review")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string("Success"));
    }

    @Test
    void getReports_ShouldReturnMap() throws Exception {
        when(adminService.getGeneralReport()).thenReturn(Map.of("totalUsers", 10));

        mockMvc.perform(get("/api/v1/admin/reports")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(10));
    }

    @Test
    void getPendingClaims_ShouldReturnList() throws Exception {
        when(adminService.getPendingClaims()).thenReturn(List.of(testClaim));

        mockMvc.perform(get("/api/v1/admin/claims/pending")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void getClaimById_ShouldReturnClaim() throws Exception {
        when(adminService.getClaimById(1L)).thenReturn(testClaim);

        mockMvc.perform(get("/api/v1/admin/claims/1")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void approveClaim_ShouldReturnSuccess() throws Exception {
        when(adminService.approveClaim(1L)).thenReturn("Approved");

        mockMvc.perform(post("/api/v1/admin/claims/1/approve")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(content().string("Approved"));
    }

    @Test
    void rejectClaim_ShouldReturnSuccess() throws Exception {
        when(adminService.rejectClaim(1L)).thenReturn("Rejected");

        mockMvc.perform(post("/api/v1/admin/claims/1/reject")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(content().string("Rejected"));
    }

    @Test
    void getAllUsers_ShouldReturnList() throws Exception {
        when(adminService.getAllUsers()).thenReturn(List.of(Map.of("id", 1)));

        mockMvc.perform(get("/api/v1/admin/users")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void activateUser_ShouldReturnSuccess() throws Exception {
        when(adminService.activateUser(1L)).thenReturn("Activated");

        mockMvc.perform(put("/api/v1/admin/users/1/activate")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(content().string("Activated"));
    }

    @Test
    void getClaimsReport_ShouldReturnList() throws Exception {
        when(adminService.getClaimsReport()).thenReturn(List.of(testClaim));

        mockMvc.perform(get("/api/v1/admin/reports/claims")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getPoliciesReport_ShouldReturnList() throws Exception {
        when(adminService.getPoliciesReport()).thenReturn(List.of(Map.of("id", 1)));

        mockMvc.perform(get("/api/v1/admin/reports/policies")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
