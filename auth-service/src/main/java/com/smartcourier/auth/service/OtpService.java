package com.smartcourier.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    // OTPs expire after 5 minutes
    private static final long OTP_EXPIRATION_MINUTES = 5;
    private static final String OTP_PREFIX = "otp:register:";

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set(OTP_PREFIX + email, otp, OTP_EXPIRATION_MINUTES, TimeUnit.MINUTES);
        log.info("Generated OTP {} for email {} (Valid for {} min)", otp, email, OTP_EXPIRATION_MINUTES);
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        String savedOtp = redisTemplate.opsForValue().get(OTP_PREFIX + email);
        if (savedOtp != null && savedOtp.equals(otp)) {
            redisTemplate.delete(OTP_PREFIX + email); // Consume OTP
            return true;
        }
        return false;
    }
}
