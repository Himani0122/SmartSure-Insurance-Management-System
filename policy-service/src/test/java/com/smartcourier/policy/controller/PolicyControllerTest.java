package com.smartcourier.policy.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcourier.policy.dto.PolicyRequest;
import com.smartcourier.policy.dto.PolicyResponse;
import com.smartcourier.policy.service.PolicyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
public class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PolicyService policyService;

    @Autowired
    private ObjectMapper objectMapper;

    private PolicyResponse testResponse;
    private PolicyRequest testRequest;

    @BeforeEach
    void setUp() {
        testResponse = PolicyResponse.builder()
                .id(1L)
                .name("Test Policy")
                .description("A comprehensive test policy description") // Fixed: 10+ chars
                .basePremium(BigDecimal.valueOf(500))
                .type("HEALTH") // Fixed: must be HEALTH|LIFE|VEHICLE|PROPERTY|OTHER
                .status("ACTIVE")
                .build();

        testRequest = new PolicyRequest();
        testRequest.setName("Test Policy");
        testRequest.setDescription("A comprehensive test policy description"); // Fixed: 10+ chars
        testRequest.setBasePremium(BigDecimal.valueOf(500));
        testRequest.setType("HEALTH"); // Fixed: must be HEALTH|LIFE|VEHICLE|PROPERTY|OTHER
    }

    @Test
    void getPolicies_ShouldReturnList() throws Exception {
        when(policyService.getPolicies()).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/policies")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Policy"));
    }

    @Test
    void createPolicy_ShouldReturnCreated() throws Exception {
        when(policyService.createPolicy(any(PolicyRequest.class))).thenReturn(testResponse);

        mockMvc.perform(post("/api/v1/policies")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void getPolicyById_ShouldReturnPolicy() throws Exception {
        when(policyService.getPolicyById(1L)).thenReturn(testResponse);

        mockMvc.perform(get("/api/v1/policies/1")
                        .header("X-Username", "user")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Policy"));
    }

    @Test
    void purchasePolicy_ShouldReturnSuccess() throws Exception {
        when(policyService.purchasePolicy(eq(1L), anyString())).thenReturn("Saga Initiated");

        mockMvc.perform(post("/api/v1/policies/1/purchase")
                        .header("X-Username", "user1")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk())
                .andExpect(content().string("Saga Initiated"));
    }

    @Test
    void searchPolicies_ShouldReturnList() throws Exception {
        when(policyService.searchPolicies("Test")).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/policies/search?query=Test")
                        .header("X-Username", "user")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Policy"));
    }

    @Test
    void getActivePolicies_ShouldReturnList() throws Exception {
        when(policyService.getActivePolicies()).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/policies/active")
                        .header("X-Username", "user")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk());
    }

    @Test
    void getExpiredPolicies_ShouldReturnList() throws Exception {
        when(policyService.getExpiredPolicies()).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/policies/expired")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    void getUserPurchasedPolicies_ShouldReturnList() throws Exception {
        when(policyService.getUserPurchasedPolicies("user1")).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/policies/user")
                        .header("X-Username", "user1")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk());
    }

    @Test
    void calculatePremium_ShouldReturnAmount() throws Exception {
        when(policyService.calculatePremium(1L)).thenReturn(BigDecimal.valueOf(550.0));

        mockMvc.perform(get("/api/v1/policies/premium/calculate/1")
                        .header("X-Username", "user")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk())
                .andExpect(content().string("550.0"));
    }

    @Test
    void getPoliciesByType_ShouldReturnList() throws Exception {
        when(policyService.getPoliciesByType("HEALTH")).thenReturn(List.of(testResponse));

        mockMvc.perform(get("/api/v1/policies/type/HEALTH")
                        .header("X-Username", "user")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk());
    }

    @Test
    void updatePolicy_ShouldReturnUpdatedPolicy() throws Exception {
        when(policyService.updatePolicy(eq(1L), any(PolicyRequest.class))).thenReturn(testResponse);

        mockMvc.perform(put("/api/v1/policies/1")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void cancelPolicy_ShouldReturnSuccess() throws Exception {
        when(policyService.cancelPolicy(eq(1L), anyString())).thenReturn("Cancelled");

        mockMvc.perform(post("/api/v1/policies/1/cancel")
                        .header("X-Username", "user1")
                        .header("X-Role", "USER"))
                .andExpect(status().isOk());
    }

    @Test
    void deletePolicy_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/policies/1")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isNoContent());
    }
}
