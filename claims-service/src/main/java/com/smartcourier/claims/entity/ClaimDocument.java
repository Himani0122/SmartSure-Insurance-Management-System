package com.smartcourier.claims.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "claim_documents")
public class ClaimDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Column(nullable = false, columnDefinition = "varchar(255) default ''")
    private String filename;

    @Column(nullable = false, columnDefinition = "varchar(255) default ''")
    private String fileUrl;

    @Column(nullable = false, columnDefinition = "timestamp default current_timestamp")
    private LocalDateTime uploadedAt;
}
