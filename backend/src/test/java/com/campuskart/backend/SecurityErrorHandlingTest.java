package com.campuskart.backend;

import com.campuskart.backend.security.JsonAccessDeniedHandler;
import com.campuskart.backend.security.JsonAuthenticationEntryPoint;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import java.io.IOException;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SecurityErrorHandlingTest {

    @Test
    void authenticationEntryPointReturns401JsonEnvelope() throws IOException {
        JsonAuthenticationEntryPoint entryPoint = new JsonAuthenticationEntryPoint();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(request, response, new AuthenticationException("unauthenticated") {
        });

        assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatus());
        assertTrue(response.getContentType().startsWith(MediaType.APPLICATION_JSON_VALUE));

        String body = response.getContentAsString();
        assertTrue(body.contains("\"status\":" + HttpStatus.UNAUTHORIZED.value()));
        assertTrue(body.contains("\"error\":\"Unauthorized\""));
        assertTrue(body.contains("\"message\":\"Authentication is required to access this resource\""));
    }

    @Test
    void accessDeniedHandlerReturns403JsonEnvelope() throws IOException {
        JsonAccessDeniedHandler handler = new JsonAccessDeniedHandler();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.handle(request, response, new AccessDeniedException("forbidden"));

        assertEquals(HttpStatus.FORBIDDEN.value(), response.getStatus());
        assertTrue(response.getContentType().startsWith(MediaType.APPLICATION_JSON_VALUE));

        String body = response.getContentAsString();
        assertTrue(body.contains("\"status\":" + HttpStatus.FORBIDDEN.value()));
        assertTrue(body.contains("\"error\":\"Forbidden\""));
        assertTrue(body.contains("\"message\":\"You do not have permission to access this resource\""));
    }
}
