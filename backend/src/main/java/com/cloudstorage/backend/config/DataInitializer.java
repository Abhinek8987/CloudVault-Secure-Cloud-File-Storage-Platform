package com.cloudstorage.backend.config;

import com.cloudstorage.backend.entity.User;
import com.cloudstorage.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin@cloudstorage.com").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin@cloudstorage.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFullName("System Administrator");
                admin.setRole("ADMIN");
                admin.setStatus("ACTIVE");
                admin.setEmailVerified(true);
                userRepository.save(admin);
                System.out.println("=================================================");
                System.out.println("          DEFAULT ADMIN ACCOUNT INITIALIZED      ");
                System.out.println("          Email: admin@cloudstorage.com          ");
                System.out.println("          Password: admin123                     ");
                System.out.println("=================================================");
            }
        };
    }
}
