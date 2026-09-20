package com.campuskart.backend.otp;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    private final SecureRandom random = new SecureRandom();

    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    public OtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String email) {
        String normalizedEmail = normalizeEmail(email);

        if (!isValidEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Invalid email");
        }

        String otp = String.format("%06d", 100000 + random.nextInt(900000));
        long expiryTime = System.currentTimeMillis() + 5 * 60 * 1000;

        otpStore.put(normalizedEmail, new OtpData(otp, expiryTime));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(normalizedEmail);
        message.setSubject("CampusKart Login OTP");
        message.setText(
                "Your CampusKart login OTP is: " + otp +
                "\n\nThis OTP is valid for 5 minutes." +
                "\n\nIf you did not request this OTP, please ignore this email."
        );

        mailSender.send(message);
    }

    public void sendLoginSuccessEmail(String email, String userName) {
        String normalizedEmail = normalizeEmail(email);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(normalizedEmail);
        message.setSubject("CampusKart Login Successful");
        message.setText(
                "Hi " + userName + ",\n\n" +
                "Your CampusKart account was successfully logged in.\n\n" +
                "Your login was completed successfully after OTP verification.\n\n" +
                "If this wasn't you, please secure your account immediately.\n\n" +
                "Thanks,\n" +
                "CampusKart Team"
        );

        mailSender.send(message);
    }

    public boolean verifyOtp(String email, String otp) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedOtp = otp == null ? "" : otp.trim();

        if (!isValidEmail(normalizedEmail) || normalizedOtp.isBlank()) {
            return false;
        }

        OtpData data = otpStore.get(normalizedEmail);

        if (data == null) {
            return false;
        }

        if (System.currentTimeMillis() > data.expiryTime) {
            otpStore.remove(normalizedEmail);
            return false;
        }

        if (!data.otp.equals(normalizedOtp)) {
            return false;
        }

        otpStore.remove(normalizedEmail);
        return true;
    }

    public void invalidateOtp(String email) {
        otpStore.remove(normalizeEmail(email));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private boolean isValidEmail(String email) {
        return email != null
                && !email.isBlank()
                && email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    private static class OtpData {

        private final String otp;
        private final long expiryTime;

        private OtpData(String otp, long expiryTime) {
            
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }
}