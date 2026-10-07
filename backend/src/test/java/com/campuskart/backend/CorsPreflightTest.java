package com.campuskart.backend;

import com.campuskart.backend.security.JwtAuthenticationFilter;
import com.campuskart.backend.security.JwtService;
import com.campuskart.backend.security.SecurityConfig;
import com.campuskart.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class CorsPreflightTest {

    private static final String VERCEL_ORIGIN =
            "https://campuskart-multi-vendor-marketplace.vercel.app";

    @Test
    void corsConfigurationAllowsProductionPreflightWithoutWildcardOrigin() {
        SecurityConfig securityConfig = new SecurityConfig(null);
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/orders");
        CorsConfiguration cors = securityConfig.corsConfigurationSource()
                .getCorsConfiguration(request);

        assertTrue(cors.getAllowedOrigins().contains(VERCEL_ORIGIN));
        assertFalse(cors.getAllowedOrigins().contains("*"));
        assertTrue(cors.getAllowCredentials());
        assertTrue(cors.getAllowedMethods().containsAll(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")));
        assertTrue(cors.getAllowedHeaders().containsAll(
                List.of("Authorization", "Content-Type")));
    }

    @Test
    void optionsRequestBypassesJwtProcessing() throws Exception {
        JwtService jwtService = mock(JwtService.class);
        UserRepository userRepository = mock(UserRepository.class);
        JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService, userRepository);
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/orders");
        request.addHeader("Authorization", "Bearer preflight-placeholder");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean chainContinued = new AtomicBoolean();
        FilterChain chain = (servletRequest, servletResponse) -> chainContinued.set(true);

        filter.doFilter(request, response, chain);

        assertTrue(chainContinued.get());
        verifyNoInteractions(jwtService, userRepository);
    }
}