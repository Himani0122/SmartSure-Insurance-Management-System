package com.smartcourier.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sagaId;
    private String userId;
    private Long policyId;
    private java.math.BigDecimal amount;
    
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    
    private String status; // PENDING, SUCCESS, FAILED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
