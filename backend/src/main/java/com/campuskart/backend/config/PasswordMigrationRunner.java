package com.campuskart.backend.config;

import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordMigrationRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordMigrationRunner(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        for (User user : userRepository.findAll()) {

            String password = user.getPassword();

            if (password != null
                    && !password.startsWith("$2a$")
                    && !password.startsWith("$2b$")
                    && !password.startsWith("$2y$")) {

                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);

                System.out.println(
                        "Password migrated for: " + user.getEmail()
                );
            }
        }
    }
}