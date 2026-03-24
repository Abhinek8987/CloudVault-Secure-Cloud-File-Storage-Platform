package com.cloudstorage.backend.dto;

import java.util.List;

public class AdminDashboardStats {
    private long totalUsers;
    private long activeUsers;
    private long blockedUsers;
    private long deletedUsers;
    private long totalFiles;
    private long totalStorageUsed;
    private List<Object[]> filesPerUser;
    private List<AdminUserDto> recentUsers;
    private List<AdminFileDto> recentFiles;

    public AdminDashboardStats() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getBlockedUsers() { return blockedUsers; }
    public void setBlockedUsers(long blockedUsers) { this.blockedUsers = blockedUsers; }

    public long getDeletedUsers() { return deletedUsers; }
    public void setDeletedUsers(long deletedUsers) { this.deletedUsers = deletedUsers; }

    public long getTotalFiles() { return totalFiles; }
    public void setTotalFiles(long totalFiles) { this.totalFiles = totalFiles; }

    public long getTotalStorageUsed() { return totalStorageUsed; }
    public void setTotalStorageUsed(long totalStorageUsed) { this.totalStorageUsed = totalStorageUsed; }

    public List<Object[]> getFilesPerUser() { return filesPerUser; }
    public void setFilesPerUser(List<Object[]> filesPerUser) { this.filesPerUser = filesPerUser; }

    public List<AdminUserDto> getRecentUsers() { return recentUsers; }
    public void setRecentUsers(List<AdminUserDto> recentUsers) { this.recentUsers = recentUsers; }

    public List<AdminFileDto> getRecentFiles() { return recentFiles; }
    public void setRecentFiles(List<AdminFileDto> recentFiles) { this.recentFiles = recentFiles; }
}
