package com.smartcourier.auth.config;

import com.smartcourier.auth.entity.User;
import com.smartcourier.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Initializing admin user restriction...");

        // 1. Delete all existing admins
        long deletedCount = userRepository.count(); // Get total before
        userRepository.deleteAllByRole("ADMIN");
        log.info("Purged existing ADMIN users.");

        // 2. Create the one hardcoded admin
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@smartsure.com")
                    .password(passwordEncoder.encode("admin123"))
                    .name("System Administrator")
                    .phone("0000000000")
                    .address("System")
                    .role("ADMIN")
                    .blocked(false)
                    .build();

            userRepository.save(admin);
            log.info("Hardcoded admin user created: admin / admin123");
        } else {
            log.info("Admin user already exists.");
        }
    }
}
