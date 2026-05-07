package com.smartcourier.policy.service;

import com.smartcourier.policy.entity.Policy;
import com.smartcourier.policy.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyExpiryScheduler {

    private final PolicyRepository policyRepository;

    // Runs every hour
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void expireOldPolicies() {
        log.info("Running scheduled task to check for expired policies...");
        LocalDateTime now = LocalDateTime.now();
        List<Policy> expiredPolicies = policyRepository.findByStatusAndExpiryDateBefore("ACTIVE", now);
        
        if (!expiredPolicies.isEmpty()) {
            for (Policy policy : expiredPolicies) {
                policy.setStatus("EXPIRED");
                log.info("Policy {} has expired.", policy.getId());
            }
            policyRepository.saveAll(expiredPolicies);
            log.info("Successfully marked {} policies as EXPIRED.", expiredPolicies.size());
        } else {
            log.info("No expired policies found.");
        }
    }
}
