package com.campuskart.backend.controller;

import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.UserRepository;
import com.campuskart.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User account registration, lookup, and profile management")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    // Create User
    @Operation(summary = "Create a new customer or seller account")
    @PostMapping
    public User createUser(@RequestBody User user) {

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("CUSTOMER");
        } else {
            user.setRole(user.getRole().trim().toUpperCase());
        }

        if (!"CUSTOMER".equals(user.getRole())
                && !"SELLER".equals(user.getRole())) {
            throw new RuntimeException(
                    "Only CUSTOMER or SELLER roles are allowed during registration");
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException(
                    "An account with this email already exists");
        }

        return userService.saveUser(user);
    }

    // Get All Users
    @Operation(summary = "List all users as an administrator")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get User By ID
    @Operation(summary = "Fetch a user by account identifier")
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public Optional<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    // Get User By Email
    @Operation(summary = "Fetch a user by email address")
    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN') or #email == authentication.principal.email")
    public Optional<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email);
    }

    // Update User
    @Operation(summary = "Update a user profile or account role")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public User updateUser(@PathVariable Long id,
                   @RequestBody User user,
                   Authentication authentication) {

        if (authentication.getAuthorities().stream()
            .noneMatch(authority ->
                "ROLE_ADMIN".equals(authority.getAuthority()))) {
            userService.getUserById(id).ifPresent(existingUser ->
                user.setRole(existingUser.getRole()));
        }

        return userService.updateUser(id, user);
    }

    // Delete User
    @Operation(summary = "Delete a user account as an administrator")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return "User deleted successfully!";
    }
}