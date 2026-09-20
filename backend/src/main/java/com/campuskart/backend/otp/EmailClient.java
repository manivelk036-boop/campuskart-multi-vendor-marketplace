package com.campuskart.backend.otp;

public interface EmailClient {

    void send(String from, String to, String subject, String text);
}