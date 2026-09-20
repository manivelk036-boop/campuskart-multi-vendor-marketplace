package com.campuskart.backend.otp;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Component
public class BrevoEmailClient implements EmailClient {

    private static final Logger logger = LoggerFactory.getLogger(BrevoEmailClient.class);
    private static final URI BREVO_EMAIL_URI = URI.create("https://api.brevo.com/v3/smtp/email");

    private final String apiKey;
    private final String fromEmail;
    private final String fromName;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public BrevoEmailClient(
            @Value("${brevo.api-key}") String apiKey,
            @Value("${brevo.from.email}") String fromEmail,
            @Value("${brevo.from.name:CampusKart}") String fromName) {
        this(apiKey, fromEmail, fromName, HttpClient.newHttpClient(), new ObjectMapper());
    }

    public BrevoEmailClient(
            String apiKey,
            String fromEmail,
            String fromName,
            HttpClient httpClient,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public void send(String from, String to, String subject, String text) {
        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "sender", Map.of("email", fromEmail, "name", fromName),
                    "to", new Map[]{Map.of("email", to)},
                    "subject", subject,
                    "htmlContent", text
            ));

            HttpRequest request = HttpRequest.newBuilder(BREVO_EMAIL_URI)
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                IllegalStateException exception =
                    new IllegalStateException("HTTP request returned a non-success status");
                logFailure(exception, response.statusCode());
                throw exception;
            }
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            logFailure(exception, null);
            throw new IllegalStateException("Failed to send email through Brevo API", exception);
        } catch (IOException exception) {
            logFailure(exception, null);
            throw new IllegalStateException("Failed to send email through Brevo API", exception);
        }
    }

    private void logFailure(Exception exception, Integer statusCode) {
        logger.error("Brevo API send failed: exceptionClass={}, statusCode={}, message={}",
                exception.getClass().getName(), statusCode, exception.getMessage());
    }
}