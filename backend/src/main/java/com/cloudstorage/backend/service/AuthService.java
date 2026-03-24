package com.cloudstorage.backend.service;

import com.cloudstorage.backend.dto.AuthRequest;
import com.cloudstorage.backend.dto.AuthResponse;
import com.cloudstorage.backend.entity.User;
import com.cloudstorage.backend.repository.UserRepository;
import com.cloudstorage.backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    private final java.util.Map<String, String> otpStorage = new java.util.concurrent.ConcurrentHashMap<>();

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String senderEmail;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuthenticationManager authenticationManager,
                       JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.mailSender = mailSender;
    }

    public AuthResponse register(AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmailVerified(false);
        user.setRole("USER");
        user.setStatus("ACTIVE");
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getUsername(), user.getFullName(), user.getRole(), user.getStatus());
    }

    public Object initiateLogin(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.isEmailVerified()) {
            String otp = String.format("%06d", new java.util.Random().nextInt(999999));
            otpStorage.put(request.getUsername(), otp);
            sendHtmlEmail(request.getUsername(), "CloudStorage Login OTP", "Dear " + (user.getFullName() != null ? user.getFullName() : "User") + ",<br/><br/>You are logging in for the first time. Please use the following OTP to verify your email:", otp);
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "First-time login requires Email Verification. OTP sent to your email!");
            response.put("requiresOtp", true);
            return response;
        } else {
            user.setLastLoginAt(java.time.LocalDateTime.now());
            userRepository.save(user);
            String jwtToken = jwtService.generateToken(user);
            return new AuthResponse(jwtToken, user.getUsername(), user.getFullName(), user.getRole(), user.getStatus());
        }
    }

    public AuthResponse verifyLoginOtp(String username, String otp) {
        String storedOtp = otpStorage.get(username);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        otpStorage.remove(username);
        
        // Save verified status
        user.setEmailVerified(true);
        user.setLastLoginAt(java.time.LocalDateTime.now());
        userRepository.save(user);

        // Send Welcome Email
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "CloudStorage");
            helper.setTo(username);
            helper.setSubject("Account Created Successfully");
            String htmlMsg = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;'>" 
                           + "<h2 style='color: #4f46e5;'>Welcome Setup Complete!</h2>"
                           + "<p style='color: #334155; font-size: 16px;'>Dear " + (user.getFullName() != null ? user.getFullName() : "User") + ",<br/><br/>Your email is now verified and your account setup is complete. You can seamlessly access your dashboard on all future logins!</p>"
                           + "<p style='color: #64748b; font-size: 14px; margin-top:30px;'>Regards,<br/><b>Abhinek Pandey</b></p>"
                           + "</div>";
            helper.setText(htmlMsg, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
        }

        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getUsername(), user.getFullName(), user.getRole(), user.getStatus());
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, currentPassword)
        );
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }

    public void sendOtp(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        otpStorage.put(username, otp);
        
        sendHtmlEmail(username, "CloudStorage Password Reset", "Dear " + (user.getFullName() != null ? user.getFullName() : "User") + ",<br/><br/>We received a request to reset your password. Please use the following OTP to proceed:", otp);
    }

    private void sendHtmlEmail(String to, String subject, String messageText, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(senderEmail, "CloudStorage Security");
            helper.setTo(to);
            helper.setSubject(subject);
            String htmlMsg = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;'>" 
                           + "<h2 style='color: #4f46e5;text-align:center;'>Security Verification</h2>"
                           + "<p style='color: #334155; font-size: 16px;'>" + messageText + "</p>"
                           + "<div style='background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;'>"
                           + "<h1 style='color: #0f172a; margin: 0; letter-spacing: 5px; font-size: 32px;'>" + otp + "</h1>"
                           + "</div>"
                           + "<p style='color: #64748b; font-size: 12px; text-align:center;'>This code will expire shortly. Do not share it with anyone.</p>"
                           + "<p style='color: #64748b; font-size: 14px; margin-top:30px;'>Regards,<br/><b>Abhinek Pandey</b></p>"
                           + "</div>";
            helper.setText(htmlMsg, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw new RuntimeException("Communication failure: Could not send OTP to email address.");
        }
    }

    public void resetPasswordWithOtp(String username, String otp, String newPassword) {
        String storedOtp = otpStorage.get(username);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(java.time.LocalDateTime.now());
        user.setEmailVerified(true);
        userRepository.save(user);
        otpStorage.remove(username);
    }
}
