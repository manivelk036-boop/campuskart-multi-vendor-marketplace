package com.campuskart.backend.service;

import com.campuskart.backend.entity.Payment;

import java.util.List;
import java.util.Optional;

public interface PaymentService {

    Payment createPayment(Payment payment, Long authenticatedUserId);

    List<Payment> getAllPayments();

    Optional<Payment> getPaymentById(Long id);

    Optional<Payment> getPaymentByOrderId(Long orderId);

    Payment updatePaymentStatus(Long id, String status);

    void deletePayment(Long id);
}
