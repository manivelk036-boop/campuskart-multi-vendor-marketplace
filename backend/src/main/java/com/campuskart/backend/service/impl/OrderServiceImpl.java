package com.campuskart.backend.service.impl;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    // Create Order
    @Override
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }

    // Get All Orders
    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Get Order By ID
    @Override
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    // Get Orders By User ID
    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    // Get Orders By Product ID
    @Override
    public List<Order> getOrdersByProductId(Long productId) {
        return orderRepository.findByProductId(productId);
    }

    // Get Orders By Status
    @Override
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    // Update Order
    @Override
    public Order updateOrder(Long id, Order updatedOrder) {

        Order existingOrder = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        existingOrder.setUserId(updatedOrder.getUserId());
        existingOrder.setProductId(updatedOrder.getProductId());
        existingOrder.setQuantity(updatedOrder.getQuantity());
        existingOrder.setTotalPrice(updatedOrder.getTotalPrice());
        existingOrder.setStatus(updatedOrder.getStatus());

        return orderRepository.save(existingOrder);
    }

    // Delete Order
    @Override
    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}