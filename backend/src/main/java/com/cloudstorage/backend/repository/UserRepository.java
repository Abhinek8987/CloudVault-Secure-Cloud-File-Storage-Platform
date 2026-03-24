package com.cloudstorage.backend.repository;

import com.cloudstorage.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    long countByStatus(String status);
    java.util.List<User> findByStatus(String status);
    java.util.List<User> findByStatusNot(String status);
}
