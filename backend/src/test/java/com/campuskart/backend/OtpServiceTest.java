package com.campuskart.backend;

import com.campuskart.backend.otp.OtpService;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;

class OtpServiceTest {

    @Test
    void expiredOtpShouldBeRejected() throws Exception {
        JavaMailSender mailSender = org.mockito.Mockito.mock(JavaMailSender.class);
        OtpService otpService = new OtpService(mailSender);
        setSenderEmail(otpService);
        setOtpData(otpService, "student@example.com", "123456", System.currentTimeMillis() - 1);

        assertFalse(otpService.verifyOtp("student@example.com", "123456"));
    }

    @Test
    void sendingOtpAgainShouldReplaceThePreviousCode() throws Exception {
        JavaMailSender mailSender = org.mockito.Mockito.mock(JavaMailSender.class);
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));
        OtpService otpService = new OtpService(mailSender);
        setSenderEmail(otpService);

        otpService.sendOtp("student@example.com");
        SimpleMailMessage firstMessage = captureSentMessage(mailSender);
        otpService.sendOtp("student@example.com");
        SimpleMailMessage secondMessage = captureSentMessage(mailSender);

        String firstOtp = firstMessage.getText().replaceAll("(?s).*: (\\d{6})\\n\\n.*", "$1");
        String secondOtp = secondMessage.getText().replaceAll("(?s).*: (\\d{6})\\n\\n.*", "$1");

        assertFalse(otpService.verifyOtp("student@example.com", firstOtp));
        assertTrue(otpService.verifyOtp("student@example.com", secondOtp));
    }

    private SimpleMailMessage captureSentMessage(JavaMailSender mailSender) {
        org.mockito.ArgumentCaptor<SimpleMailMessage> captor =
                org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, org.mockito.Mockito.atLeastOnce()).send(captor.capture());
        return captor.getAllValues().get(captor.getAllValues().size() - 1);
    }

    @SuppressWarnings("unchecked")
    private void setOtpData(OtpService otpService, String email, String otp, long expiryTime) throws Exception {
        Field storeField = OtpService.class.getDeclaredField("otpStore");
        storeField.setAccessible(true);
        Map<String, Object> store = (ConcurrentHashMap<String, Object>) storeField.get(otpService);

        Class<?> otpDataClass = Class.forName("com.campuskart.backend.otp.OtpService$OtpData");
        Constructor<?> constructor = otpDataClass.getDeclaredConstructor(String.class, long.class);
        constructor.setAccessible(true);
        store.put(email, constructor.newInstance(otp, expiryTime));
    }

    private void setSenderEmail(OtpService otpService) throws Exception {
        Field senderField = OtpService.class.getDeclaredField("senderEmail");
        senderField.setAccessible(true);
        senderField.set(otpService, "no-reply@campuskart.example");
    }
}
