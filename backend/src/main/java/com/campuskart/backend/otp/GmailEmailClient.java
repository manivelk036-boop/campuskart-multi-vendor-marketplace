package com.campuskart.backend.otp;

import com.google.api.client.auth.oauth2.BearerToken;
import com.google.api.client.auth.oauth2.ClientParametersAuthentication;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleOAuthConstants;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.HttpResponseException;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class GmailEmailClient implements EmailClient {

    private static final Logger logger = LoggerFactory.getLogger(GmailEmailClient.class);

    private final Gmail gmail;

    @Autowired
    public GmailEmailClient(
            @Value("${gmail.client-id}") String clientId,
            @Value("${gmail.client-secret}") String clientSecret,
            @Value("${gmail.refresh-token}") String refreshToken) throws Exception {
        this(createGmail(clientId, clientSecret, refreshToken));
    }

    public GmailEmailClient(Gmail gmail) {
        this.gmail = gmail;
    }

    @Override
    public void send(String from, String to, String subject, String text) {
        String rawMessage = "From: " + from + "\r\n"
                + "To: " + to + "\r\n"
                + "Subject: " + subject + "\r\n"
                + "Content-Type: text/plain; charset=UTF-8\r\n"
                + "Content-Transfer-Encoding: 8bit\r\n"
                + "\r\n"
                + text;

        Message message = new Message().setRaw(Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(rawMessage.getBytes(StandardCharsets.UTF_8)));

        try {
            gmail.users().messages().send("me", message).execute();
        } catch (Exception exception) {
            Integer statusCode = exception instanceof HttpResponseException httpException
                    ? httpException.getStatusCode()
                    : null;
            logger.error("Gmail API send failed: exceptionClass={}, statusCode={}, message={}",
                    exception.getClass().getName(), statusCode, exception.getMessage());
            throw new IllegalStateException("Failed to send email through Gmail API", exception);
        }
    }

    private static Gmail createGmail(
            String clientId,
            String clientSecret,
            String refreshToken) throws Exception {
        HttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
        JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
        Credential credential = new Credential.Builder(BearerToken.authorizationHeaderAccessMethod())
                .setTransport(transport)
                .setJsonFactory(jsonFactory)
                .setTokenServerEncodedUrl(GoogleOAuthConstants.TOKEN_SERVER_URL)
                .setClientAuthentication(new ClientParametersAuthentication(clientId, clientSecret))
                .build()
                .setRefreshToken(refreshToken);

        return new Gmail.Builder(transport, jsonFactory, credential)
                .setApplicationName("CampusKart")
                .build();
    }
}