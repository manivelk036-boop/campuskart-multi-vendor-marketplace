package com.campuskart.backend;

import com.campuskart.backend.config.AdminAccountSeeder;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAccountSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void createsAdminOnlyWhenMissingAndHashesPassword() {
        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("StrongLocalAdminPass123!"))
                .thenReturn("$2a$10$encoded-password");

        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                passwordEncoder,
                "admin@example.com",
                "StrongLocalAdminPass123!"
        );

        seeder.run();

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User created = captor.getValue();
        assertEquals("ADMIN", created.getRole());
        assertEquals("admin@example.com", created.getEmail());
        assertEquals("System Admin", created.getFullName());
        assertEquals("$2a$10$encoded-password", created.getPassword());
    }

    @Test
    void doesNothingWhenAdminAlreadyExists() {
        when(userRepository.findByEmail("admin@example.com"))
                .thenReturn(Optional.of(new User()));

        AdminAccountSeeder seeder = new AdminAccountSeeder(
                userRepository,
                passwordEncoder,
                "admin@example.com",
                "StrongLocalAdminPass123!"
        );

        seeder.run();

        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }
}
