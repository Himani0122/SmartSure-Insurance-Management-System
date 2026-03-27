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
    void deletePolicy_ShouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/policies/1")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isNoContent());
    }
}
