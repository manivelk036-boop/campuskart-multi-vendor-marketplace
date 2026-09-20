package com.campuskart.backend;

import com.campuskart.backend.otp.GmailEmailClient;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class GmailEmailClientTest {

    @Test
    void sendsEncodedMessageThroughGmailApiWithoutNetworkCalls() throws Exception {
        Gmail gmail = mock(Gmail.class);
        Gmail.Users users = mock(Gmail.Users.class);
        Gmail.Users.Messages messages = mock(Gmail.Users.Messages.class);
        Gmail.Users.Messages.Send send = mock(Gmail.Users.Messages.Send.class);

        when(gmail.users()).thenReturn(users);
        when(users.messages()).thenReturn(messages);
        when(messages.send(eq("me"), any(Message.class))).thenReturn(send);

        GmailEmailClient emailClient = new GmailEmailClient(gmail);
        emailClient.send("from@example.com", "to@example.com", "Subject", "Message body");

        var messageCaptor = org.mockito.ArgumentCaptor.forClass(Message.class);
        verify(messages).send(org.mockito.ArgumentMatchers.eq("me"), messageCaptor.capture());

        String decoded = new String(Base64.getUrlDecoder().decode(messageCaptor.getValue().getRaw()),
                StandardCharsets.UTF_8);
        assertTrue(decoded.contains("From: from@example.com"));
        assertTrue(decoded.contains("To: to@example.com"));
        assertTrue(decoded.contains("Subject: Subject"));
        assertTrue(decoded.contains("Message body"));
        verify(send).execute();
    }
}
