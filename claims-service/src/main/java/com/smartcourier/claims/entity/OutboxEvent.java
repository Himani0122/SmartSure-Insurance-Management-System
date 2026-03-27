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
@Table(name = "outbox_events")
public class OutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "varchar(255) default ''")
    private String aggregateType;

    @Column(nullable = false, columnDefinition = "varchar(255) default ''")
    private String aggregateId;

    @Column(nullable = false, columnDefinition = "varchar(255) default ''")
    private String eventType;

    @Column(columnDefinition = "TEXT default ''", nullable = false)
    private String payload;

    @Column(nullable = false, columnDefinition = "varchar(255) default 'PENDING'")
    private String status; // PENDING, PUBLISHED

    @Column(nullable = false, columnDefinition = "timestamp default current_timestamp")
    private LocalDateTime createdAt;

    private LocalDateTime publishedAt;
}
