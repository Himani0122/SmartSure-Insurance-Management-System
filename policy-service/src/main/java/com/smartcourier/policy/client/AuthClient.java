package com.smartcourier.policy.client;

import com.smartcourier.policy.dto.external.NotificationRequest;
import com.smartcourier.policy.dto.external.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "auth-service", url = "${AUTH_SERVICE_URL:http://auth-service:8083}")
public interface AuthClient {

    @GetMapping("/api/v1/auth/internal/user/{username}")
    UserResponse getUserByUsername(@PathVariable("username") String username);

    @PostMapping("/api/v1/auth/internal/send-notification")
    void sendNotification(@RequestBody NotificationRequest request);
}
