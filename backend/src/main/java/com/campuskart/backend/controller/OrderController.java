package com.campuskart.backend.controller;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    // =========================
    // CREATE ORDER
    // =========================

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') and #order.userId == authentication.principal.id")
    public Order createOrder(
            @RequestBody Order order) {
        return orderService.saveOrder(order);
    }

    // =========================
    // GET ALL ORDERS
    // ADMIN
    // =========================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // =========================
    // GET ORDER BY ID
    // =========================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'SELLER')")
    public Optional<Order> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {

        Optional<Order> order = orderService.getOrderById(id);
        order.ifPresent(value -> requireOrderAccess(value, authentication));

        return order;
    }

    // =========================
    // GET CUSTOMER ORDERS
    // =========================

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('CUSTOMER') and #userId == authentication.principal.id")
    public List<Order> getOrdersByUser(
            @PathVariable Long userId) {

        return orderService.getOrdersByUserId(userId);
    }

    // =========================
    // GET SELLER ORDERS
    // SELLER DASHBOARD
    // =========================

    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasRole('SELLER') and #sellerId == authentication.principal.id")
    public List<Order> getOrdersBySeller(
            @PathVariable Long sellerId) {

        return orderService.getOrdersBySellerId(sellerId);
    }

    // =========================
    // GET ORDERS BY PRODUCT
    // =========================

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public List<Order> getOrdersByProduct(
            @PathVariable Long productId,
            Authentication authentication) {

        requireSellerOwnsProduct(productId, authentication);

        return orderService.getOrdersByProductId(productId);
    }

    // =========================
    // GET ORDERS BY STATUS
    // =========================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getOrdersByStatus(
            @PathVariable String status) {

        return orderService.getOrdersByStatus(status);
    }

    // =========================
    // UPDATE COMPLETE ORDER
    // =========================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Order updateOrder(
            @PathVariable Long id,
            @RequestBody Order order) {

        return orderService.updateOrder(id, order);
    }

    // =====================================================
    // SELLER ORDER STATUS MANAGEMENT
    // =====================================================

    // ACCEPT ORDER
    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Order> acceptOrder(
            @PathVariable Long id,
            Authentication authentication) {

        requireSellerOwnsOrder(id, authentication);

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, "ACCEPTED")
        );
    }

    // REJECT ORDER
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Order> rejectOrder(
            @PathVariable Long id,
            Authentication authentication) {

        requireSellerOwnsOrder(id, authentication);

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, "REJECTED")
        );
    }

    // PROCESS ORDER
    @PutMapping("/{id}/process")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Order> processOrder(
            @PathVariable Long id,
            Authentication authentication) {

        requireSellerOwnsOrder(id, authentication);

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, "PROCESSING")
        );
    }

    // MARK ORDER READY
    @PutMapping("/{id}/ready")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Order> readyOrder(
            @PathVariable Long id,
            Authentication authentication) {

        requireSellerOwnsOrder(id, authentication);

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, "READY")
        );
    }

    // COMPLETE ORDER
  @PutMapping("/{id}/complete")
@PreAuthorize("hasRole('SELLER')")
public ResponseEntity<Order> completeOrder(
                @PathVariable Long id,
                Authentication authentication) {

        requireSellerOwnsOrder(id, authentication);

    return ResponseEntity.ok(
            orderService.updateOrderStatus(id, "DELIVERED")
    );
}

    // =========================
    // DELETE ORDER
    // =========================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteOrder(
            @PathVariable Long id) {

        orderService.deleteOrder(id);

        return "Order deleted successfully!";
    }

    private void requireOrderAccess(
            Order order,
            Authentication authentication) {

        if (hasRole(authentication, "ROLE_ADMIN")) {
            return;
        }

        User authenticatedUser = (User) authentication.getPrincipal();

        if (hasRole(authentication, "ROLE_CUSTOMER")
                && authenticatedUser.getId().equals(order.getUserId())) {
            return;
        }

        if (hasRole(authentication, "ROLE_SELLER")) {
            requireSellerOwnsProduct(order.getProductId(), authentication);
            return;
        }

        throw new AccessDeniedException("You cannot access this order");
    }

    private void requireSellerOwnsOrder(
            Long orderId,
            Authentication authentication) {

        Order order = orderService.getOrderById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        requireSellerOwnsProduct(order.getProductId(), authentication);
    }

    private void requireSellerOwnsProduct(
            Long productId,
            Authentication authentication) {

        User authenticatedUser = (User) authentication.getPrincipal();
        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        if (product.getSeller() == null
                || !authenticatedUser.getId().equals(product.getSeller().getId())) {
            throw new AccessDeniedException(
                    "You can only access orders for your products");
        }
    }

    private boolean hasRole(
            Authentication authentication,
            String role) {

        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        role.equals(authority.getAuthority()));
    }
}