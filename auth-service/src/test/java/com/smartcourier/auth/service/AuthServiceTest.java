package com.smartcourier.auth.service;

import com.smartcourier.auth.dto.AuthResponse;
import com.smartcourier.auth.dto.LoginRequest;
import com.smartcourier.auth.dto.RegisterRequest;
import com.smartcourier.auth.dto.UserResponse;
import com.smartcourier.auth.dto.RefreshTokenRequest;
import com.smartcourier.auth.dto.ChangePasswordRequest;
import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.UserRepository;
import com.smartcourier.auth.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User user;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@test.com")
                .password("hashed-password")
                .role("USER")
                .build();

        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@test.com");
        registerRequest.setPassword("password");
        registerRequest.setRole("USER");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password");
    }

    @Test
    void register_Success() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("mock-token");

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("mock-token", response.getToken());
        assertNotNull(response.getRefreshToken());
        verify(userRepository, times(1)).save(any(User.class));
        verify(passwordEncoder, times(1)).encode(anyString());
    }

    @Test
    void login_Success() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("mock-token");

        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock-token", response.getToken());
        assertNotNull(response.getRefreshToken());
        verify(passwordEncoder, times(1)).matches(anyString(), anyString());
    }

    @Test
    void login_WrongPassword() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });

        assertEquals("Invalid username or password", exception.getMessage());
    }

    @Test
    void register_UsernameAlreadyTaken() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        assertTrue(exception.getMessage().contains("Username is already taken"));
    }

    @Test
    void login_UserBlocked() {
        user.setBlocked(true);
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertTrue(exception.getMessage().contains("blocked"));
    }

    @Test
    void refreshToken_Success() {
        when(userRepository.findByRefreshToken(anyString())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("new-token");

        com.smartcourier.auth.dto.RefreshTokenRequest request = new com.smartcourier.auth.dto.RefreshTokenRequest();
        request.setRefreshToken("old-refresh");

        AuthResponse response = authService.refreshToken(request);
        assertEquals("new-token", response.getToken());
    }

    @Test
    void updateProfile_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        com.smartcourier.auth.dto.UpdateProfileRequest request = new com.smartcourier.auth.dto.UpdateProfileRequest();
        request.setUsername("newuser");
        request.setEmail("new@test.com");

        authService.updateProfile("testuser", request);

        assertEquals("newuser", user.getUsername());
        assertEquals("new@test.com", user.getEmail());
    }

    @Test
    void blockUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        authService.blockUser(1L);
        assertTrue(user.isBlocked());
    }

    @Test
    void activateUser_Success() {
        user.setBlocked(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        authService.activateUser(1L);
        assertFalse(user.isBlocked());
    }

    @Test
    void logout_Success() {
        user.setRefreshToken("some-token");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        authService.logout("testuser");
        assertNull(user.getRefreshToken());
    }

    @Test
    void register_EmailAlreadyRegistered() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
    }

    @Test
    void login_UserNotFound() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
    }

    @Test
    void refreshToken_InvalidToken() {
        when(userRepository.findByRefreshToken(anyString())).thenReturn(Optional.empty());
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("invalid");
        assertThrows(RuntimeException.class, () -> authService.refreshToken(request));
    }

    @Test
    void changePassword_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("new-hashed-password");

        ChangePasswordRequest request = new ChangePasswordRequest("oldPw", "newPw");
        authService.changePassword("testuser", request);

        assertEquals("new-hashed-password", user.getPassword());
    }

    @Test
    void getAllUsers_Success() {
        when(userRepository.findAll()).thenReturn(java.util.List.of(user));
        java.util.List<UserResponse> result = authService.getAllUsers();
        assertEquals(1, result.size());
    }

    @Test
    void deleteUser_Success() {
        doNothing().when(userRepository).deleteById(1L);
        authService.deleteUser(1L);
        verify(userRepository, times(1)).deleteById(1L);
    }
}
