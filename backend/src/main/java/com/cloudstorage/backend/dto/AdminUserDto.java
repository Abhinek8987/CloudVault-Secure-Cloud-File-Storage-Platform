package com.cloudstorage.backend.dto;

import com.cloudstorage.backend.entity.User;

public class AdminUserDto {
    private Long id;
    private String username;
    private String fullName;
    private String role;
    private String status;
    private boolean isEmailVerified;
    private java.time.LocalDateTime deletedAt;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private java.time.LocalDateTime lastLoginAt;
    private java.time.LocalDateTime passwordChangedAt;

    public AdminUserDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.fullName = user.getFullName();
        this.role = user.getRole();
        this.status = user.getStatus();
        this.isEmailVerified = user.isEmailVerified();
        this.deletedAt = user.getDeletedAt();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.lastLoginAt = user.getLastLoginAt();
        this.passwordChangedAt = user.getPasswordChangedAt();
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
    public boolean isEmailVerified() { return isEmailVerified; }
    public java.time.LocalDateTime getDeletedAt() { return deletedAt; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public java.time.LocalDateTime getLastLoginAt() { return lastLoginAt; }
    public java.time.LocalDateTime getPasswordChangedAt() { return passwordChangedAt; }
}
