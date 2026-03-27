package com.smartcourier.api_gateway.filter;

import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RouteValidatorTest {

    private final RouteValidator validator = new RouteValidator();

    @Test
    void isSecured_WhenPublicRoute_ShouldReturnFalse() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login").build();
        assertFalse(validator.isSecured(request));
    }

    @Test
    void isSecured_WhenSecuredRoute_ShouldReturnTrue() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/policy/all").build();
        assertTrue(validator.isSecured(request));
    }

    @Test
    void isSecured_WhenSwaggerRoute_ShouldReturnFalse() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/v3/api-docs").build();
        assertFalse(validator.isSecured(request));
    }

    @Test
    void isSecured_WhenEurekaRoute_ShouldReturnFalse() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/eureka").build();
        assertFalse(validator.isSecured(request));
    }
}
