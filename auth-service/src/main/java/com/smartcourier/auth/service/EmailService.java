package com.smartcourier.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final com.smartcourier.auth.repository.NotificationRepository notificationRepository;

    @Value("${spring.mail.username:noreply@smartsure.com}")
    private String senderEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "🔐 SmartSure - Your Verification Code";
        String htmlBody = getHtmlTemplate("Email Verification", 
            "Welcome to SmartSure! Use the code below to verify your email address.",
            "<div style='font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 5px; margin: 20px 0;'>" + otp + "</div>" +
            "<p style='color: #64748b;'>This code is valid for 5 minutes. Please do not share it with anyone.</p>");
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendWelcomeEmail(String toEmail, String name) {
        String subject = "✨ Welcome to SmartSure!";
        String htmlBody = getHtmlTemplate("Welcome to SmartSure", 
            "Hello " + name + ", we're thrilled to have you on board!",
            "<p>Your account has been successfully created. You can now explore our premium insurance policies, file claims with ease, and manage your entire portfolio from your dashboard.</p>" +
            "<div style='margin: 30px 0;'><a href='http://localhost/dashboard' style='background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;'>Go to Dashboard</a></div>");
        sendHtmlEmail(toEmail, subject, htmlBody);
    }

    public void sendNotification(String toEmail, String username, String subject, String body) {
        String htmlBody = getHtmlTemplate("SmartSure Notification", 
            subject,
            "<p style='white-space: pre-line;'>" + body + "</p>" +
            "<div style='margin: 30px 0;'><a href='http://localhost/dashboard' style='background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;'>View Details</a></div>");
        
        sendHtmlEmail(toEmail, subject, htmlBody);
        
        if (username != null && !username.isEmpty()) {
            try {
                com.smartcourier.auth.entity.Notification notification = com.smartcourier.auth.entity.Notification.builder()
                        .username(username)
                        .message(subject)
                        .type("INFO")
                        .createdAt(java.time.LocalDateTime.now())
                        .isRead(false)
                        .build();
                notificationRepository.save(notification);
                log.info("In-app notification saved for user: {}", username);
            } catch (Exception e) {
                log.error("Failed to save in-app notification: {}", e.getMessage());
            }
        }
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        log.info("Sending HTML email to {} with subject: {}", toEmail, subject);
        try {
            jakarta.mail.internet.MimeMessage message = javaMailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(senderEmail, "SmartSure Insurance");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            javaMailSender.send(message);
            log.info("HTML Email successfully sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send HTML email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String getHtmlTemplate(String title, String subtitle, String content) {
        return "<!DOCTYPE html>" +
               "<html>" +
               "<head>" +
               "<style>" +
               "  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }" +
               "  .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }" +
               "  .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; color: white; }" +
               "  .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; }" +
               "  .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }" +
               "  .content { padding: 40px; text-align: center; }" +
               "  .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }" +
               "  .logo { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #6366f1; }" +
               "</style>" +
               "</head>" +
               "<body>" +
               "  <div class='container'>" +
               "    <div class='header'>" +
               "      <h1>" + title + "</h1>" +
               "      <p>" + subtitle + "</p>" +
               "    </div>" +
               "    <div class='content'>" +
               "      <div class='logo'>🛡️ SmartSure</div>" +
               "      " + content + "" +
               "    </div>" +
               "    <div class='footer'>" +
               "      <p>&copy; 2026 SmartSure Insurance Management System. All rights reserved.</p>" +
               "      <p>This is an automated message, please do not reply.</p>" +
               "    </div>" +
               "  </div>" +
               "</body>" +
               "</html>";
    }
}
