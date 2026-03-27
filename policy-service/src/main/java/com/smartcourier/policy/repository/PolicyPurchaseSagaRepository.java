package com.smartcourier.policy.repository;

import com.smartcourier.policy.entity.PolicyPurchaseSaga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyPurchaseSagaRepository extends JpaRepository<PolicyPurchaseSaga, Long> {
    List<PolicyPurchaseSaga> findByUserIdAndStatus(String userId, String status);
    List<PolicyPurchaseSaga> findByStatus(String status);
}
