package com.campuskart.backend;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Payment;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.repository.PaymentRepository;
import com.campuskart.backend.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @Test
    void createPaymentRejectsDuplicatePayment() {
        Order order = new Order(10L, 7L, 3L, 1, 250.0, "PENDING");
        Payment existingPayment = new Payment();
        Payment payment = new Payment(null, 10L, 1.0, "UPI", null, null);

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(10L))
                .thenReturn(Optional.of(existingPayment));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> paymentService.createPayment(payment, 7L));

        assertEquals("Payment already exists for this order", exception.getMessage());
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void createPaymentUsesServerOrderAmountAndGeneratesSuccessDetails() {
        Order order = new Order(10L, 7L, 3L, 1, 250.0, "PENDING");
        Payment payment = new Payment(null, 10L, 1.0, "CARD", null, null);

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));
        when(paymentRepository.findByOrderId(10L)).thenReturn(Optional.empty());
        when(paymentRepository.save(payment)).thenReturn(payment);

        Payment result = paymentService.createPayment(payment, 7L);

        assertEquals(250.0, result.getAmount());
        assertEquals("SUCCESS", result.getPaymentStatus());
        assertEquals("CARD", result.getPaymentMethod());
        org.junit.jupiter.api.Assertions.assertTrue(
                result.getTransactionId().startsWith("TXN-"));
    }
}
