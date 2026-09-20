package com.campuskart.backend;

import com.campuskart.backend.controller.AuthController;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.otp.OtpController;
import com.campuskart.backend.otp.OtpService;
import com.campuskart.backend.repository.UserRepository;
import com.campuskart.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doThrow;

@ExtendWith(MockitoExtension.class)
class AuthControllerOtpFlowTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private OtpService otpService;

    @InjectMocks
    private AuthController authController;

        @InjectMocks
        private OtpController otpController;

    @Test
    void loginShouldValidateCredentialsAndSendOtpInsteadOfReturningJwt() {
        User user = new User();
        user.setEmail("student@example.com");
        user.setPassword("encoded");
        user.setRole("CUSTOMER");
        user.setFullName("Demo Student");

        when(userRepository.findByEmail("student@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "encoded"))
                .thenReturn(true);

        ResponseEntity<?> response = authController.login(
                new AuthController.LoginRequest("student@example.com", "secret123")
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        Map<?, ?> body = (Map<?, ?>) response.getBody();
        assertNotNull(body);
        assertTrue(body.containsKey("message"));
        assertEquals("OTP sent successfully. Please verify the code.", body.get("message"));
        assertFalse(body.containsKey("token"));

        verify(otpService).sendOtp("student@example.com");
    }

    @Test
    void verifyOtpShouldSendLoginSuccessEmailAfterSuccessfulVerification() {
        User user = new User();
        user.setId(7L);
        user.setEmail("student@example.com");
        user.setRole("CUSTOMER");
        user.setFullName("Demo Student");

        when(otpService.verifyOtp("student@example.com", "123456"))
                .thenReturn(true);
        when(userRepository.findByEmail("student@example.com"))
                .thenReturn(Optional.of(user));
        when(jwtService.generateToken("student@example.com", "CUSTOMER"))
                .thenReturn("jwt-token");

        ResponseEntity<Map<String, Object>> response = otpController.verifyOtp(
                Map.of("email", "student@example.com", "otp", "123456")
        );

        assertEquals(200, response.getStatusCode().value());
        assertEquals("jwt-token", response.getBody().get("token"));
        verify(otpService).sendLoginSuccessEmail("student@example.com", "Demo Student");
    }

    @Test
    void verifyOtpShouldContinueWhenLoginSuccessEmailFails() {
        User user = new User();
        user.setEmail("student@example.com");
        user.setRole("CUSTOMER");
        user.setFullName("Demo Student");

        when(otpService.verifyOtp("student@example.com", "123456"))
                .thenReturn(true);
        when(userRepository.findByEmail("student@example.com"))
                .thenReturn(Optional.of(user));
        when(jwtService.generateToken("student@example.com", "CUSTOMER"))
                .thenReturn("jwt-token");
        doThrow(new RuntimeException("mail unavailable"))
                .when(otpService)
                .sendLoginSuccessEmail("student@example.com", "Demo Student");

        ResponseEntity<Map<String, Object>> response = otpController.verifyOtp(
                Map.of("email", "student@example.com", "otp", "123456")
        );

        assertEquals(200, response.getStatusCode().value());
        assertEquals("jwt-token", response.getBody().get("token"));
        assertTrue((Boolean) response.getBody().get("verified"));
    }
}
