package com.smartcourier.admin.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "auth-service", path = "/api/v1/auth")
public interface AuthClient {
    @GetMapping("/all-users")
    List<Map<String, Object>> getAllUsers();

    @PutMapping("/users/{id}/block") // Assuming these exist or will be added to auth-service
    void blockUser(@PathVariable("id") Long id);

    @PutMapping("/users/{id}/activate")
    void activateUser(@PathVariable("id") Long id);
}
