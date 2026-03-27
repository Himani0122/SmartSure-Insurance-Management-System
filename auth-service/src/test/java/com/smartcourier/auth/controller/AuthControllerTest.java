package com.smartcourier.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcourier.auth.dto.*;
import com.smartcourier.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    private AuthResponse authResponse;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        authResponse = new AuthResponse("token", "refresh-token");
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setPassword("Admin@123"); // meets @Pattern: 8+ chars, 1 uppercase, 1 digit
        registerRequest.setEmail("test@gmail.com"); // meets email regex abc@gmail.com format
    }

    @Test
    void register_ShouldReturnCreated() throws Exception {
        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("token"));
    }

    @Test
    void login_ShouldReturnOk() throws Exception {
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("Admin@123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"));
    }

    @Test
    void updateProfile_ShouldReturnOk() throws Exception {
        UpdateProfileRequest request = new UpdateProfileRequest("newuser", "newuser@gmail.com");
        mockMvc.perform(put("/api/v1/auth/update-profile")
                        .header("X-Username", "testuser")
                        .header("X-Role", "USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Profile updated successfully"));
    }

    @Test
    void changePassword_ShouldReturnOk() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest("OldPass@1", "NewPass@2"); // both meet strength rules
        mockMvc.perform(put("/api/v1/auth/change-password")
                        .header("X-Username", "testuser")
                        .header("X-Role", "USER")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Password changed successfully"));
    }

    @Test
    void deleteUser_ShouldReturnOk() throws Exception {
        mockMvc.perform(delete("/api/v1/auth/delete/1")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(content().string("User deleted successfully"));
    }

    @Test
    void getAllUsers_ShouldReturnList() throws Exception {
        when(authService.getAllUsers()).thenReturn(List.of(new UserResponse()));

        mockMvc.perform(get("/api/v1/auth/all-users")
                        .header("X-Username", "admin")
                        .header("X-Role", "ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }
}
