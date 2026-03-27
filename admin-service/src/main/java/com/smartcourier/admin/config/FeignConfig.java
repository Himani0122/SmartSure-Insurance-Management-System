package com.smartcourier.admin.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                
                // Forward the security headers from the current incoming request
                String username = request.getHeader("X-Username");
                String role = request.getHeader("X-Role");

                if (username != null) {
                    requestTemplate.header("X-Username", username);
                }
                if (role != null) {
                    requestTemplate.header("X-Role", role);
                }
            }
        };
    }
}
