package com.campuskart.backend.otp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class ResendEmailClient implements EmailClient {

    private final RestClient restClient;
    private final String apiKey;

        @Autowired
        public ResendEmailClient(@Value("${resend.api-key}") String apiKey) {
                this(RestClient.builder(), apiKey);
        }

        public ResendEmailClient(RestClient.Builder restClientBuilder, String apiKey) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.resend.com")
                .build();
        this.apiKey = apiKey;
    }

    @Override
    public void send(String from, String to, String subject, String text) {
        restClient.post()
                .uri("/emails")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "from", from,
                        "to", List.of(to),
                        "subject", subject,
                        "text", text
                ))
                .retrieve()
                .toBodilessEntity();
    }
}