package com.cloudstorage.backend.dto;

import java.time.LocalDateTime;

public class FileResponse {
    private Long id;
    private String filename;
    private String originalFilename;
    private Long size;
    private String contentType;
    private LocalDateTime uploadDate;

    public FileResponse(Long id, String filename, String originalFilename, Long size, String contentType, LocalDateTime uploadDate) {
        this.id = id;
        this.filename = filename;
        this.originalFilename = originalFilename;
        this.size = size;
        this.contentType = contentType;
        this.uploadDate = uploadDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
}
