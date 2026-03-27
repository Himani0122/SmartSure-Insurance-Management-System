package com.smartcourier.claims.repository;

import com.smartcourier.claims.entity.ClaimDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClaimDocumentRepository extends JpaRepository<ClaimDocument, Long> {
}
