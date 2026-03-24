package com.cloudstorage.backend.repository;

import com.cloudstorage.backend.entity.FileItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileItemRepository extends JpaRepository<FileItem, Long> {
    List<FileItem> findByUserIdOrderByUploadDateDesc(Long userId);
    
    void deleteByUserId(Long userId);
    List<FileItem> findByUserId(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(f.size), 0) FROM FileItem f")
    Long sumAllFileSizes();
    
    @org.springframework.data.jpa.repository.Query("SELECT u.username, COUNT(f.id) FROM User u LEFT JOIN FileItem f ON u.id = f.user.id GROUP BY u.username")
    List<Object[]> countFilesPerUser();
}
