package com.campuskart.backend.controller;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    // =========================
    // CREATE ORDER
    // =========================

    @PostMapping
    public Order createOrder(@RequestBody Order order) {
        return orderService.saveOrder(order);
    }

    // =========================
    // GET ALL ORDERS
    // ADMIN
    // =========================

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    // =========================
    // GET ORDER BY ID
    // =========================

    @GetMapping("/{id}")
    public Optional<Order> getOrderById(
            @PathVariable Long id) {

        return orderService.getOrderById(id);
    }

    // =========================
    // GET CUSTOMER ORDERS
    // =========================

    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUser(
            @PathVariable Long userId) {

        return orderService.getOrdersByUserId(userId);
    }

    // =========================
    // GET SELLER ORDERS
    // SELLER DASHBOARD
    // =========================

    @GetMapping("/seller/{sellerId}")
    public List<Order> getOrdersBySeller(
            @PathVariable Long sellerId) {

        return orderService.getOrdersBySellerId(sellerId);
    }

    // =========================
    // GET ORDERS BY PRODUCT
    // =========================

    @GetMapping("/product/{productId}")
    public List<Order> getOrdersByProduct(
            @PathVariable Long productId) {

        return orderService.getOrdersByProductId(productId);
    }

    // =========================
    // GET ORDERS BY STATUS
    // =========================

    @GetMapping("/status/{status}")
    public List<Order> getOrdersByStatus(
            @PathVariable String status) {

        return orderService.getOrdersByStatus(status);
    }

    // =========================
    // UPDATE COMPLETE ORDER
    // =========================

    @PutMapping("/{id}")
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
    public ResponseEntity<Order> acceptOrder(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, "ACCEPTED")
        );
    }

    // REJECT ORDER
    @PutMapping("/{id}/reject")
    public ResponseEntity<Order> rejectOrder(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, "REJECTED")
        );
    }

    // PROCESS ORDER
    @PutMapping("/{id}/process")
    public ResponseEntity<Order> processOrder(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, "PROCESSING")
        );
    }

    // MARK ORDER READY
    @PutMapping("/{id}/ready")
    public ResponseEntity<Order> readyOrder(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, "READY")
        );
    }

    // COMPLETE ORDER
  @PutMapping("/{id}/complete")
public ResponseEntity<Order> completeOrder(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            orderService.updateOrderStatus(id, "DELIVERED")
    );
}

    // =========================
    // DELETE ORDER
    // =========================

    @DeleteMapping("/{id}")
    public String deleteOrder(
            @PathVariable Long id) {

        orderService.deleteOrder(id);

        return "Order deleted successfully!";
    }
}