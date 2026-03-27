package com.smartcourier.policy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "policies")
public class Policy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal basePremium;

    private String type;
    
    @Column(nullable = false, columnDefinition = "varchar(255) default 'ACTIVE'")
    private String status; // ACTIVE, EXPIRED, CANCELLED

    @Column(nullable = false, columnDefinition = "timestamp default current_timestamp")
    private LocalDateTime expiryDate;
}
