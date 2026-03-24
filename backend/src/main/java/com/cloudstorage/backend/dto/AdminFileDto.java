package com.cloudstorage.backend.dto;

import com.cloudstorage.backend.entity.FileItem;
import java.time.LocalDateTime;

public class AdminFileDto {
    private Long id;
    private String filename;
    private String originalFilename;
    private Long size;
    private String contentType;
    private LocalDateTime uploadDate;
    private String uploadedBy;

    public AdminFileDto(FileItem file) {
        this.id = file.getId();
        this.filename = file.getFilename();
        this.originalFilename = file.getOriginalFilename();
        this.size = file.getSize();
        this.contentType = file.getContentType();
        this.uploadDate = file.getUploadDate();
        this.uploadedBy = file.getUser() != null ? file.getUser().getUsername() : "Unknown";
    }

    public Long getId() { return id; }
    public String getFilename() { return filename; }
    public String getOriginalFilename() { return originalFilename; }
    public Long getSize() { return size; }
    public String getContentType() { return contentType; }
    public LocalDateTime getUploadDate() { return uploadDate; }
    public String getUploadedBy() { return uploadedBy; }
}
