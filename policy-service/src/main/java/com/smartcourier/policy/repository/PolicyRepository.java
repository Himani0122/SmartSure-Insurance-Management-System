package com.smartcourier.policy.repository;

import com.smartcourier.policy.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByType(String type);
    List<Policy> findByStatus(String status);
    List<Policy> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
