package com.campuskart.backend.service;

import com.campuskart.backend.entity.Order;

import java.util.List;
import java.util.Optional;

public interface OrderService {

    // Create Order
    Order saveOrder(Order order);

    // Get All Orders
    List<Order> getAllOrders();

    // Get Order By ID
    Optional<Order> getOrderById(Long id);

    // Get Orders By User ID
    List<Order> getOrdersByUserId(Long userId);

    // Get Orders By Product ID
    List<Order> getOrdersByProductId(Long productId);

    // Get Orders By Status
    List<Order> getOrdersByStatus(String status);

    // Update Order
    Order updateOrder(Long id, Order updatedOrder);

    // Delete Order
    void deleteOrder(Long id);

}