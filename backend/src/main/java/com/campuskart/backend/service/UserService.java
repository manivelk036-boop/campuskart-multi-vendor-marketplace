package com.campuskart.backend.service;

import com.campuskart.backend.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserService {

    User saveUser(User user);

    List<User> getAllUsers();

    Optional<User> getUserById(Long id);

    Optional<User> getUserByEmail(String email);

    User updateUser(Long id, User updatedUser);

    void deleteUser(Long id);

}