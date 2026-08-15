package com.campuskart.backend.service;

import com.campuskart.backend.entity.Order;

import java.util.List;
import java.util.Optional;

public interface OrderService {

    // =========================
    // CREATE ORDER
    // =========================

    Order saveOrder(Order order);


    // =========================
    // GET ALL ORDERS
    // =========================

    List<Order> getAllOrders();


    // =========================
    // GET ORDER BY ID
    // =========================

    Optional<Order> getOrderById(Long id);


    // =========================
    // GET ORDERS BY USER
    // CUSTOMER ORDERS
    // =========================

    List<Order> getOrdersByUserId(Long userId);


    // =========================
    // GET ORDERS BY PRODUCT
    // =========================

    List<Order> getOrdersByProductId(Long productId);


    // =========================
    // GET ORDERS BY STATUS
    // =========================

    List<Order> getOrdersByStatus(String status);


    // =========================
    // GET ORDERS BY SELLER
    // SELLER DASHBOARD
    // =========================

    List<Order> getOrdersBySellerId(Long sellerId);


    // =========================
    // UPDATE ORDER
    // =========================

    Order updateOrder(Long id, Order order);


    // =========================
    // DELETE ORDER
    // =========================

    void deleteOrder(Long id);
}