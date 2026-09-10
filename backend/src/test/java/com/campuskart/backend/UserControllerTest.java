package com.campuskart.backend;

import com.campuskart.backend.controller.UserController;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.UserRepository;
import com.campuskart.backend.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserController userController;

    @Test
    void customerRegistrationIsAllowed() {
        User user = user("customer@example.com", "CUSTOMER");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.empty());
        when(userService.saveUser(user)).thenReturn(user);

        User result = userController.createUser(user);

        assertEquals("CUSTOMER", result.getRole());
        verify(userService).saveUser(user);
    }

    @Test
    void sellerRegistrationIsAllowed() {
        User user = user("seller@example.com", "seller");
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.empty());
        when(userService.saveUser(user)).thenReturn(user);

        User result = userController.createUser(user);

        assertEquals("SELLER", result.getRole());
        verify(userService).saveUser(user);
    }

    @Test
    void missingRoleDefaultsToCustomer() {
        User user = user("default@example.com", null);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.empty());
        when(userService.saveUser(user)).thenReturn(user);

        User result = userController.createUser(user);

        assertEquals("CUSTOMER", result.getRole());
        verify(userService).saveUser(user);
    }

    @Test
    void adminRegistrationIsRejected() {
        User user = user("admin@example.com", "ADMIN");

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userController.createUser(user));

        assertEquals(
                "Only CUSTOMER or SELLER roles are allowed during registration",
                exception.getMessage());
        verify(userService, never()).saveUser(user);
    }

    @Test
    void invalidRoleRegistrationIsRejected() {
        User user = user("invalid@example.com", "MODERATOR");

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userController.createUser(user));

        assertEquals(
                "Only CUSTOMER or SELLER roles are allowed during registration",
                exception.getMessage());
        verify(userService, never()).saveUser(user);
    }

    @Test
    void duplicateEmailRegistrationIsRejected() {
        User user = user("duplicate@example.com", "CUSTOMER");
        when(userRepository.findByEmail(user.getEmail()))
                .thenReturn(Optional.of(new User()));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userController.createUser(user));

        assertEquals(
                "An account with this email already exists",
                exception.getMessage());
        verify(userService, never()).saveUser(user);
    }

    private User user(String email, String role) {
        User user = new User();
        user.setFullName("Test User");
        user.setEmail(email);
        user.setPassword("password");
        user.setRole(role);
        return user;
    }
}
