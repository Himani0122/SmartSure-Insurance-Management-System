package com.smartcourier.claims.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "claims")
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "varchar(255) default ''")
    private String username;

    @Column(nullable = false, columnDefinition = "bigint default 0")
    private Long policyId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, unique = true, columnDefinition = "varchar(255) default ''") // Idempotency check via unique key
    private String idempotencyKey;

    private String documentPath;

    @Column(nullable = false, columnDefinition = "varchar(255) default 'PENDING'")
    private String status; // e.g., PENDING, APPROVED, REJECTED

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClaimDocument> documents = new ArrayList<>();
}
