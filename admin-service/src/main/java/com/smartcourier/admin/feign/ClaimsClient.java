package com.smartcourier.admin.feign;

import com.smartcourier.admin.dto.ClaimResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "claims-service", path = "/api/v1/claims")
public interface ClaimsClient {
    @GetMapping("/{id}")
    ClaimResponse getClaimById(@PathVariable("id") Long id);

    @GetMapping
    List<ClaimResponse> getAllClaims();

    @GetMapping("/pending")
    List<ClaimResponse> getPendingClaims();
}
