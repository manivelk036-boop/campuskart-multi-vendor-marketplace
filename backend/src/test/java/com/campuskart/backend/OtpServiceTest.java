package com.campuskart.backend;

import com.campuskart.backend.otp.OtpService;
import org.junit.jupiter.api.Test;
import com.campuskart.backend.otp.EmailClient;

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
        EmailClient emailClient = org.mockito.Mockito.mock(EmailClient.class);
        OtpService otpService = new OtpService(emailClient);
        setSenderEmail(otpService);
        setOtpData(otpService, "student@example.com", "123456", System.currentTimeMillis() - 1);

        assertFalse(otpService.verifyOtp("student@example.com", "123456"));
    }

    @Test
    void sendingOtpAgainShouldReplaceThePreviousCode() throws Exception {
        EmailClient emailClient = org.mockito.Mockito.mock(EmailClient.class);
        doNothing().when(emailClient).send(any(), any(), any(), any());
        OtpService otpService = new OtpService(emailClient);
        setSenderEmail(otpService);

        otpService.sendOtp("student@example.com");
        String firstMessage = captureSentText(emailClient);
        otpService.sendOtp("student@example.com");
        String secondMessage = captureSentText(emailClient);

        String firstOtp = firstMessage.replaceAll("(?s).*: (\\d{6})\\n\\n.*", "$1");
        String secondOtp = secondMessage.replaceAll("(?s).*: (\\d{6})\\n\\n.*", "$1");

        assertFalse(otpService.verifyOtp("student@example.com", firstOtp));
        assertTrue(otpService.verifyOtp("student@example.com", secondOtp));
    }

        private String captureSentText(EmailClient emailClient) {
        org.mockito.ArgumentCaptor<String> captor =
            org.mockito.ArgumentCaptor.forClass(String.class);
        verify(emailClient, org.mockito.Mockito.atLeastOnce())
            .send(any(), any(), any(), captor.capture());
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
