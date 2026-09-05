package com.campuskart.backend;

import com.campuskart.backend.controller.PaymentController;
import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Payment;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private PaymentController paymentController;

    @Test
    void customerCanReadOwnPayment() {
        Payment payment = new Payment(1L, 10L, 250.0, "UPI", "SUCCESS", "TXN-1");
        User customer = user(7L);
        Authentication authentication = authentication(customer, "ROLE_CUSTOMER");

        when(paymentService.getPaymentById(1L)).thenReturn(Optional.of(payment));
        when(orderRepository.findById(10L))
                .thenReturn(Optional.of(new Order(10L, 7L, 3L, 1, 250.0, "PENDING")));

        assertEquals(200, paymentController
                .getPaymentById(1L, authentication)
                .getStatusCode().value());
    }

    @Test
    void customerCannotReadAnotherCustomersPaymentById() {
        Payment payment = new Payment(1L, 10L, 250.0, "UPI", "SUCCESS", "TXN-1");
        Authentication authentication = authentication(user(8L), "ROLE_CUSTOMER");

        when(paymentService.getPaymentById(1L)).thenReturn(Optional.of(payment));
        when(orderRepository.findById(10L))
                .thenReturn(Optional.of(new Order(10L, 7L, 3L, 1, 250.0, "PENDING")));

        assertThrows(
                AccessDeniedException.class,
                () -> paymentController.getPaymentById(1L, authentication));
    }

    @Test
    void customerCannotReadAnotherCustomersPaymentByOrderId() {
        Payment payment = new Payment(1L, 10L, 250.0, "UPI", "SUCCESS", "TXN-1");
        Authentication authentication = authentication(user(8L), "ROLE_CUSTOMER");

        when(paymentService.getPaymentByOrderId(10L)).thenReturn(Optional.of(payment));
        when(orderRepository.findById(10L))
                .thenReturn(Optional.of(new Order(10L, 7L, 3L, 1, 250.0, "PENDING")));

        assertThrows(
                AccessDeniedException.class,
                () -> paymentController.getPaymentByOrderId(10L, authentication));
    }

    private User user(Long id) {
        User user = new User();
        user.setId(id);
        user.setRole("CUSTOMER");
        return user;
    }

    private Authentication authentication(User user, String role) {
        return new UsernamePasswordAuthenticationToken(
                user,
                null,
                List.of(new SimpleGrantedAuthority(role)));
    }
}
