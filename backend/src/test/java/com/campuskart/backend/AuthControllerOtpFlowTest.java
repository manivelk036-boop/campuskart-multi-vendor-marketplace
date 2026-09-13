package com.campuskart.backend;

import com.campuskart.backend.controller.AuthController;
import com.campuskart.backend.entity.User;
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
}
