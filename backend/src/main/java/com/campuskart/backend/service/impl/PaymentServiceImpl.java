package com.campuskart.backend.service.impl;

import com.campuskart.backend.entity.Payment;
import com.campuskart.backend.entity.Order;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.repository.PaymentRepository;
import com.campuskart.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Override
    public Payment createPayment(
            Payment payment,
            Long authenticatedUserId) {

        Order order = payment.getOrderId() == null
                ? null
                : orderRepository.findById(payment.getOrderId())
                        .orElse(null);

        if (order == null) {
            throw new RuntimeException("Order not found");
        }

        if (!order.getUserId().equals(authenticatedUserId)) {
            throw new RuntimeException(
                    "You are not authorized to pay for this order");
        }

        if (payment.getPaymentMethod() == null
                || payment.getPaymentMethod().isBlank()) {
            throw new RuntimeException("Payment method is required");
        }

        payment.setAmount(order.getTotalPrice());
        payment.setPaymentStatus("SUCCESS");

        payment.setTransactionId(
                "TXN-" + UUID.randomUUID()
        );

        return paymentRepository.save(payment);
    }

    @Override
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    @Override
    public Optional<Payment> getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    @Override
    public Payment updatePaymentStatus(Long id, String status) {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payment not found with ID: " + id
                        )
                );

        payment.setPaymentStatus(status);

        return paymentRepository.save(payment);
    }

    @Override
    public void deletePayment(Long id) {

        if (!paymentRepository.existsById(id)) {
            throw new RuntimeException(
                    "Payment not found with ID: " + id
            );
        }

        paymentRepository.deleteById(id);
    }
}