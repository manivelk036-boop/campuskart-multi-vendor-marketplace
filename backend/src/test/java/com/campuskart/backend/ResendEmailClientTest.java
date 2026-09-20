package com.campuskart.backend;

import com.campuskart.backend.otp.ResendEmailClient;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ResendEmailClientTest {

    @Test
    void sendsResendRequestWithBearerAuthenticationAndEmailPayload() {
        RestClient restClient = mock(RestClient.class);
        RestClient.RequestBodyUriSpec post = mock(RestClient.RequestBodyUriSpec.class);
        RestClient.RequestBodySpec request = mock(RestClient.RequestBodySpec.class);
        RestClient.ResponseSpec response = mock(RestClient.ResponseSpec.class);
        RestClient.Builder builder = mock(RestClient.Builder.class);

        when(builder.baseUrl("https://api.resend.com")).thenReturn(builder);
        when(builder.build()).thenReturn(restClient);
        when(restClient.post()).thenReturn(post);
        when(post.uri("/emails")).thenReturn(request);
        when(request.header("Authorization", "Bearer resend-test-key")).thenReturn(request);
        when(request.contentType(MediaType.APPLICATION_JSON)).thenReturn(request);
        doReturn(request).when(request).body(any(Object.class));
        when(request.retrieve()).thenReturn(response);

        ResendEmailClient emailClient = new ResendEmailClient(builder, "resend-test-key");
        emailClient.send("no-reply@example.com", "student@example.com", "Subject", "Message");

        verify(restClient).post();
        verify(post).uri("/emails");
        verify(request).header("Authorization", "Bearer resend-test-key");
        verify(request).contentType(MediaType.APPLICATION_JSON);

        var bodyCaptor = org.mockito.ArgumentCaptor.forClass(Object.class);
        verify(request).body(bodyCaptor.capture());
        Map<?, ?> body = (Map<?, ?>) bodyCaptor.getValue();
        assertEquals("no-reply@example.com", body.get("from"));
        assertEquals(java.util.List.of("student@example.com"), body.get("to"));
        assertEquals("Subject", body.get("subject"));
        assertEquals("Message", body.get("text"));
    }
}