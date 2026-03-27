package com.smartcourier.admin.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;

@FeignClient(name = "policy-service", path = "/api/v1/policies")
public interface PolicyClient {
    @GetMapping
    List<Map<String, Object>> getPolicies();
}
