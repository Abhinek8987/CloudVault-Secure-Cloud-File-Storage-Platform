package com.cloudstorage.backend.controller;

import com.cloudstorage.backend.dto.AuthRequest;
import com.cloudstorage.backend.dto.AuthResponse;
import com.cloudstorage.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(authService.initiateLogin(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-login")
    public ResponseEntity<?> verifyLogin(@RequestBody java.util.Map<String, String> request) {
        try {
            AuthResponse response = authService.verifyLoginOtp(request.get("username"), request.get("otp"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", "Verification failed: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody com.cloudstorage.backend.dto.ChangePasswordRequest request) {
        try {
            authService.changePassword(request.getUsername(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", "Failed to change password: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody java.util.Map<String, String> request) {
        try {
            authService.sendOtp(request.get("username"));
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "OTP has been sent to your registered email!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", "Failed to send OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        try {
            authService.resetPasswordWithOtp(request.get("username"), request.get("otp"), request.get("newPassword"));
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Password successfully reset! You may now log in."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", "Failed to reset password: " + e.getMessage()));
        }
    }
}
