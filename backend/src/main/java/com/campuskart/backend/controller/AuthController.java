package com.campuskart.backend.controller;

import com.campuskart.backend.entity.User;
import com.campuskart.backend.otp.OtpService;
import com.campuskart.backend.repository.UserRepository;
import com.campuskart.backend.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Login and authentication endpoints")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpService otpService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }

    @Operation(summary = "Validate credentials and send a one-time OTP to the supplied email")
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        String email = request.getEmail() == null
                ? ""
                : request.getEmail().trim().toLowerCase(Locale.ROOT);
        String password = request.getPassword();

        if (email.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Email is required");
        }

        if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid email");
        }

        if (password == null || password.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body("Password is required");
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid email or password");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid email or password");
        }

        otpService.sendOtp(email);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "OTP sent successfully. Please verify the code.");
        response.put("requiresOtp", true);
        response.put("email", email);
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    public static class LoginRequest {

        private String email;
        private String password;

        public LoginRequest() {
        }

        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}