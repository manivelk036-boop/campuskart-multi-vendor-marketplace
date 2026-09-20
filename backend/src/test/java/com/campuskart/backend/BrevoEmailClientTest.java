package com.campuskart.backend;

import com.campuskart.backend.otp.BrevoEmailClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Flow;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BrevoEmailClientTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void sendsBrevoRequestWithConfiguredSenderAndJsonPayloadWithoutNetworkCalls() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(201);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(response);

        BrevoEmailClient emailClient = new BrevoEmailClient(
                "test-api-key",
                "no-reply@example.com",
                "CampusKart Test",
                httpClient,
                objectMapper);

        emailClient.send("ignored@example.com", "student@example.com", "Subject", "Message body");

        var requestCaptor = org.mockito.ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient).send(requestCaptor.capture(), any(HttpResponse.BodyHandler.class));

        HttpRequest request = requestCaptor.getValue();
        JsonNode body = objectMapper.readTree(readBody(request));
        assertEquals("POST", request.method());
        assertEquals("https://api.brevo.com/v3/smtp/email", request.uri().toString());
        assertEquals("test-api-key", request.headers().firstValue("api-key").orElseThrow());
        assertEquals("no-reply@example.com", body.at("/sender/email").asText());
        assertEquals("CampusKart Test", body.at("/sender/name").asText());
        assertEquals("student@example.com", body.at("/to/0/email").asText());
        assertEquals("Subject", body.at("/subject").asText());
        assertEquals("Message body", body.at("/htmlContent").asText());
    }

    @Test
    void rejectsNonSuccessBrevoResponseWithoutReadingResponseBody() throws Exception {
        HttpClient httpClient = mock(HttpClient.class);
        HttpResponse<String> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(401);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(response);

        BrevoEmailClient emailClient = new BrevoEmailClient(
                "test-api-key",
                "no-reply@example.com",
                "CampusKart",
                httpClient,
                objectMapper);

        assertThrows(IllegalStateException.class,
                () -> emailClient.send("from@example.com", "to@example.com", "Subject", "Body"));
    }

        private String readBody(HttpRequest request) throws Exception {
                CompletableFuture<String> bodyFuture = new CompletableFuture<>();
                StringBuilder body = new StringBuilder();

                request.bodyPublisher().orElseThrow().subscribe(new Flow.Subscriber<>() {
                        @Override
                        public void onSubscribe(Flow.Subscription subscription) {
                                subscription.request(Long.MAX_VALUE);
                        }

                        @Override
                        public void onNext(ByteBuffer item) {
                                body.append(StandardCharsets.UTF_8.decode(item));
                        }

                        @Override
                        public void onError(Throwable throwable) {
                                bodyFuture.completeExceptionally(throwable);
                        }

                        @Override
                        public void onComplete() {
                                bodyFuture.complete(body.toString());
                        }
                });

                return bodyFuture.get();
        }
}