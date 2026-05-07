package com.smartcourier.payment.repository;

import com.smartcourier.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findBySagaId(Long sagaId);
}
