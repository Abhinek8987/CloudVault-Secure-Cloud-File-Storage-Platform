package com.cloudstorage.backend.service;

import com.cloudstorage.backend.dto.AdminDashboardStats;
import com.cloudstorage.backend.dto.AdminFileDto;
import com.cloudstorage.backend.dto.AdminUserDto;
import com.cloudstorage.backend.dto.AuthRequest;
import com.cloudstorage.backend.entity.FileItem;
import com.cloudstorage.backend.entity.User;
import com.cloudstorage.backend.repository.FileItemRepository;
import com.cloudstorage.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.cloudstorage.backend.dto.AdminUserProfileDto;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final FileItemRepository fileItemRepository;
    private final FileService fileService;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, FileItemRepository fileItemRepository, FileService fileService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.fileItemRepository = fileItemRepository;
        this.fileService = fileService;
        this.passwordEncoder = passwordEncoder;
    }

    public AdminDashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("ACTIVE");
        long blockedUsers = userRepository.countByStatus("BLOCKED");
        long deletedUsers = userRepository.countByStatus("DELETED");
        long totalFiles = fileItemRepository.count();
        Long totalStorageRaw = fileItemRepository.sumAllFileSizes();
        long totalStorage = totalStorageRaw != null ? totalStorageRaw : 0L;
        
        AdminDashboardStats stats = new AdminDashboardStats();
        stats.setTotalUsers(totalUsers);
        stats.setActiveUsers(activeUsers);
        stats.setBlockedUsers(blockedUsers);
        stats.setDeletedUsers(deletedUsers);
        stats.setTotalFiles(totalFiles);
        stats.setTotalStorageUsed(totalStorage);
        stats.setFilesPerUser(fileItemRepository.countFilesPerUser());
        
        stats.setRecentUsers(userRepository.findAll().stream()
            .sorted((u1, u2) -> u2.getId().compareTo(u1.getId()))
            .limit(10)
            .map(AdminUserDto::new)
            .collect(Collectors.toList()));
            
        stats.setRecentFiles(fileItemRepository.findAll().stream()
            .sorted((f1, f2) -> f2.getUploadDate().compareTo(f1.getUploadDate()))
            .limit(30)
            .map(AdminFileDto::new)
            .collect(Collectors.toList()));
            
        return stats;
    }

    public List<AdminUserDto> getAllUsers() {
        return userRepository.findByStatusNot("DELETED").stream()
                .map(AdminUserDto::new)
                .collect(Collectors.toList());
    }
    
    public List<AdminUserDto> getDeletedUsers() {
        return userRepository.findByStatus("DELETED").stream()
                .map(AdminUserDto::new)
                .collect(Collectors.toList());
    }
    
    public AdminUserProfileDto getUserProfile(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        List<AdminFileDto> associatedFiles = fileItemRepository.findByUserIdOrderByUploadDateDesc(user.getId())
                .stream().map(AdminFileDto::new).collect(Collectors.toList());
        long totalStorageUsed = associatedFiles.stream().mapToLong(AdminFileDto::getSize).sum();
        
        return new AdminUserProfileDto(new AdminUserDto(user), associatedFiles, totalStorageUsed);
    }

    public AdminUserDto createUser(AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmailVerified(true);
        user.setRole(request.getRole() != null && "ADMIN".equalsIgnoreCase(request.getRole()) ? "ADMIN" : "USER");
        user.setStatus("ACTIVE");
        userRepository.save(user);
        
        return new AdminUserDto(user);
    }

    public void blockUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("BLOCKED");
        userRepository.save(user);
    }

    public void unblockUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("ACTIVE");
        userRepository.save(user);
    }
    
    public void softDeleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if ("ADMIN".equals(user.getRole())) throw new RuntimeException("Cannot delete an Administrator account.");
        user.setStatus("DELETED");
        user.setDeletedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
    }
    
    public void restoreUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("ACTIVE");
        user.setDeletedAt(null);
        userRepository.save(user);
    }
    
    public void permanentlyDeleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if ("ADMIN".equals(user.getRole())) throw new RuntimeException("Cannot permanent delete an Administrator account.");
        
        // CASCADING DISK DELETION
        List<FileItem> userFiles = fileItemRepository.findByUserId(user.getId());
        for (FileItem file : userFiles) {
            fileService.deleteFile(file.getId(), user.getUsername());
        }
        userRepository.deleteById(user.getId());
    }

    public List<AdminFileDto> getAllFiles() {
        return fileItemRepository.findAll().stream()
                .map(AdminFileDto::new)
                .collect(Collectors.toList());
    }

    public void deleteFileGlobally(Long fileId) {
        FileItem file = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        // Leveraging existing FileService which deletes from Azure or local storage
        fileService.deleteFile(file.getId(), file.getUser().getUsername());
    }

    public void vaultFile(Long fileId) {
        FileItem fileItem = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        try {
            Path filePath = fileService.getFileStorageLocation().resolve(fileItem.getFilename()).normalize();
            Path vaultedPath = filePath.resolveSibling(fileItem.getFilename() + ".vault");
            if (Files.exists(filePath)) {
                Files.move(filePath, vaultedPath);
                fileItem.setOriginalFilename("[VAULTED] " + fileItem.getOriginalFilename());
                fileItemRepository.save(fileItem);
            } else if (Files.exists(vaultedPath)) {
                throw new RuntimeException("File is already vaulted.");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to vault file.", e);
        }
    }

    public void restoreFile(Long fileId) {
        FileItem fileItem = fileItemRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        try {
            Path filePath = fileService.getFileStorageLocation().resolve(fileItem.getFilename()).normalize();
            Path vaultedPath = filePath.resolveSibling(fileItem.getFilename() + ".vault");
            if (Files.exists(vaultedPath)) {
                Files.move(vaultedPath, filePath);
                fileItem.setOriginalFilename(fileItem.getOriginalFilename().replace("[VAULTED] ", ""));
                fileItemRepository.save(fileItem);
            } else {
                throw new RuntimeException("No vaulted file found to restore.");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to restore file.", e);
        }
    }
}
