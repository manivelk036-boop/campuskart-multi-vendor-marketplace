package com.campuskart.backend.controller;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

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
@Tag(name = "Orders", description = "Order creation, retrieval, seller workflow, and fulfillment status endpoints")
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

    @Operation(summary = "Create an order for the authenticated customer")
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

    @Operation(summary = "List all orders as an administrator")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // =========================
    // GET ORDER BY ID
    // =========================

    @Operation(summary = "Fetch an order by identifier with role-aware access checks")
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

    @Operation(summary = "Fetch all orders placed by a customer")
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

    @Operation(summary = "Fetch all orders for products sold by a seller")
    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasRole('SELLER') and #sellerId == authentication.principal.id")
    public List<Order> getOrdersBySeller(
            @PathVariable Long sellerId) {

        return orderService.getOrdersBySellerId(sellerId);
    }

    // =========================
    // GET ORDERS BY PRODUCT
    // =========================

    @Operation(summary = "Fetch orders for a product while enforcing seller ownership")
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

    @Operation(summary = "Fetch orders by fulfillment status as an administrator")
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Order> getOrdersByStatus(
            @PathVariable String status) {

        return orderService.getOrdersByStatus(status);
    }

    // =========================
    // UPDATE COMPLETE ORDER
    // =========================

    @Operation(summary = "Admin update of an order record")
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
    @Operation(summary = "Accept an order as the owning seller")
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
    @Operation(summary = "Reject an order as the owning seller")
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
    @Operation(summary = "Move an order to processing as the owning seller")
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
    @Operation(summary = "Mark an order ready for delivery as the owning seller")
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
    @Operation(summary = "Complete and deliver an order as the owning seller")
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

    @Operation(summary = "Delete an order as an administrator")
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