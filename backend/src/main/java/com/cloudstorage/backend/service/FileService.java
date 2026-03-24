package com.cloudstorage.backend.service;

import com.cloudstorage.backend.dto.FileResponse;
import com.cloudstorage.backend.entity.FileItem;
import com.cloudstorage.backend.entity.User;
import com.cloudstorage.backend.repository.FileItemRepository;
import com.cloudstorage.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FileService {

    private final Path fileStorageLocation;
    private final FileItemRepository fileItemRepository;
    private final UserRepository userRepository;

    public FileService(@Value("${file.upload-dir}") String uploadDir,
                       FileItemRepository fileItemRepository,
                       UserRepository userRepository) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.fileItemRepository = fileItemRepository;
        this.userRepository = userRepository;

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public Path getFileStorageLocation() {
        return this.fileStorageLocation;
    }

    public FileResponse storeFile(MultipartFile file, String username) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        try {
            if (originalFilename.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFilename);
            }

            String extension = "";
            int i = originalFilename.lastIndexOf('.');
            if (i > 0) {
                extension = originalFilename.substring(i);
            }
            String newFilename = UUID.randomUUID().toString() + extension;

            Path targetLocation = this.fileStorageLocation.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            FileItem fileItem = new FileItem();
            fileItem.setFilename(newFilename);
            fileItem.setOriginalFilename(originalFilename);
            fileItem.setSize(file.getSize());
            fileItem.setContentType(file.getContentType());
            fileItem.setUploadDate(LocalDateTime.now());
            fileItem.setUser(user);

            fileItemRepository.save(fileItem);

            return mapToFileResponse(fileItem);
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

    public List<FileResponse> getAllFilesForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return fileItemRepository.findByUserIdOrderByUploadDateDesc(user.getId())
                .stream()
                .filter(fileItem -> !fileItem.getOriginalFilename().startsWith("[VAULTED] "))
                .map(this::mapToFileResponse)
                .collect(Collectors.toList());
    }

    public Resource loadFileAsResource(Long fileId, String username) {
        FileItem fileItem = getFileItemForUser(fileId, username);
        try {
            Path filePath = this.fileStorageLocation.resolve(fileItem.getFilename()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileItem.getOriginalFilename());
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found " + fileItem.getOriginalFilename(), ex);
        }
    }

    public FileItem getFileItemForUser(Long fileId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        FileItem fileItem = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File metadata not found"));
        
        if (!fileItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to file");
        }
        return fileItem;
    }

    public void deleteFile(Long fileId, String username) {
        FileItem fileItem = getFileItemForUser(fileId, username);
        try {
            Path filePath = this.fileStorageLocation.resolve(fileItem.getFilename()).normalize();
            Files.deleteIfExists(filePath);
            fileItemRepository.delete(fileItem);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + fileItem.getOriginalFilename(), ex);
        }
    }

    private FileResponse mapToFileResponse(FileItem fileItem) {
        return new FileResponse(
                fileItem.getId(),
                fileItem.getFilename(),
                fileItem.getOriginalFilename(),
                fileItem.getSize(),
                fileItem.getContentType(),
                fileItem.getUploadDate()
        );
    }
}
