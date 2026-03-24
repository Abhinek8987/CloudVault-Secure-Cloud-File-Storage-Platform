package com.cloudstorage.backend.dto;

import java.util.List;

public class AdminUserProfileDto {
    private AdminUserDto userDetails;
    private List<AdminFileDto> associatedFiles;
    private long totalStorageUsed;

    public AdminUserProfileDto(AdminUserDto userDetails, List<AdminFileDto> associatedFiles, long totalStorageUsed) {
        this.userDetails = userDetails;
        this.associatedFiles = associatedFiles;
        this.totalStorageUsed = totalStorageUsed;
    }

    public AdminUserDto getUserDetails() { return userDetails; }
    public void setUserDetails(AdminUserDto userDetails) { this.userDetails = userDetails; }

    public List<AdminFileDto> getAssociatedFiles() { return associatedFiles; }
    public void setAssociatedFiles(List<AdminFileDto> associatedFiles) { this.associatedFiles = associatedFiles; }

    public long getTotalStorageUsed() { return totalStorageUsed; }
    public void setTotalStorageUsed(long totalStorageUsed) { this.totalStorageUsed = totalStorageUsed; }
}
