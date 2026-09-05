package com.campuskart.backend.controller;

import com.campuskart.backend.entity.Payment;
import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

        @Autowired
        private OrderRepository orderRepository;

    // CREATE PAYMENT
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Payment> createPayment(
            @RequestBody Payment payment,
            Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                paymentService.createPayment(payment, user.getId())
        );
    }

    // GET ALL PAYMENTS - ADMIN
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    // GET PAYMENT BY ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<Payment> getPaymentById(
                        @PathVariable Long id,
                        Authentication authentication) {

        return paymentService.getPaymentById(id)
                                .map(payment -> {
                                        requirePaymentAccess(payment, authentication);
                                        return ResponseEntity.ok(payment);
                                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // GET PAYMENT BY ORDER
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<Payment> getPaymentByOrderId(
                        @PathVariable Long orderId,
                        Authentication authentication) {

        return paymentService.getPaymentByOrderId(orderId)
                                .map(payment -> {
                                        requirePaymentAccess(payment, authentication);
                                        return ResponseEntity.ok(payment);
                                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // UPDATE PAYMENT STATUS - ADMIN
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                paymentService.updatePaymentStatus(id, status)
        );
    }

    // DELETE PAYMENT - ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deletePayment(
            @PathVariable Long id) {

        paymentService.deletePayment(id);

        return ResponseEntity.ok(
                "Payment deleted successfully!"
        );
    }

        private void requirePaymentAccess(
                        Payment payment,
                        Authentication authentication) {

                if (authentication.getAuthorities().stream()
                                .anyMatch(authority ->
                                                "ROLE_ADMIN".equals(authority.getAuthority()))) {
                        return;
                }

                User authenticatedUser = (User) authentication.getPrincipal();
                Order order = orderRepository.findById(payment.getOrderId())
                                .orElseThrow(() -> new RuntimeException("Order not found"));

                if (!authenticatedUser.getId().equals(order.getUserId())) {
                        throw new org.springframework.security.access.AccessDeniedException(
                                        "You can only access your own payments");
                }
        }
}