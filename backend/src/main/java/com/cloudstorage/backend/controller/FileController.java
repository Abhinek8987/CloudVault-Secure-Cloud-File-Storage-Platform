package com.cloudstorage.backend.controller;

import com.cloudstorage.backend.dto.FileResponse;
import com.cloudstorage.backend.entity.FileItem;
import com.cloudstorage.backend.service.FileService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(@RequestParam("file") MultipartFile file, Authentication authentication) {
        String username = authentication.getName();
        FileResponse response = fileService.storeFile(file, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<FileResponse>> getFiles(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(fileService.getAllFilesForUser(username));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        Resource resource = fileService.loadFileAsResource(id, username);
        FileItem fileItem = fileService.getFileItemForUser(id, username);

        String contentType = fileItem.getContentType();
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileItem.getOriginalFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        fileService.deleteFile(id, username);
        return ResponseEntity.noContent().build();
    }
}
