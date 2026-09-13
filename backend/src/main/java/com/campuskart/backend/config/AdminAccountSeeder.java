package com.campuskart.backend.config;

import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("!prod")
public class AdminAccountSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminAccountSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_EMAIL:admin@example.com}") String adminEmail,
            @Value("${ADMIN_PASSWORD:}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            return;
        }

        String normalizedEmail = adminEmail == null
                ? "admin@example.com"
                : adminEmail.trim().toLowerCase();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            return;
        }

        User admin = new User();
        admin.setFullName("System Admin");
        admin.setEmail(normalizedEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole("ADMIN");

        userRepository.save(admin);
    }
}
