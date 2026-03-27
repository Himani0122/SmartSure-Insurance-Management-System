package com.smartcourier.claims.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDocumentResponse {
    private Long id;
    private String filename;
    private String fileUrl;
    private LocalDateTime uploadedAt;
}
