package com.smartcourier.claims.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartcourier.claims.dto.ClaimInitiateRequest;
import com.smartcourier.claims.dto.ClaimResponse;
import com.smartcourier.claims.service.ClaimsService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class ClaimsController {

    private final ClaimsService claimsService;

    @PostMapping(value = "/upload-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-Username") String username) {

        String path = claimsService.uploadDocument(file, username);
        return ResponseEntity.ok(path);
    }

    @PostMapping("/initiate-claim")
    public ResponseEntity<ClaimResponse> initiateClaim(
            @Valid @RequestBody ClaimInitiateRequest request,
            @RequestHeader("X-Username") String username) {
        return new ResponseEntity<>(claimsService.initiateClaim(request, username), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/track")
    public ResponseEntity<ClaimResponse> trackClaim(@PathVariable("id") Long id) {
        return new ResponseEntity<>(claimsService.trackClaim(id), HttpStatus.OK);
    }
}
