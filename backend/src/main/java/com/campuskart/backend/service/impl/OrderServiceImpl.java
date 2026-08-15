package com.campuskart.backend.service.impl;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;


    // =========================
    // CREATE ORDER
    // =========================

    @Override
    public Order saveOrder(Order order) {
        return orderRepository.save(order);
    }


    // =========================
    // GET ALL ORDERS
    // =========================

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }


    // =========================
    // GET ORDER BY ID
    // =========================

    @Override
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }


    // =========================
    // GET ORDERS BY USER
    // CUSTOMER ORDERS
    // =========================

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }


    // =========================
    // GET ORDERS BY PRODUCT
    // =========================

    @Override
    public List<Order> getOrdersByProductId(Long productId) {
        return orderRepository.findByProductId(productId);
    }


    // =========================
    // GET ORDERS BY STATUS
    // =========================

    @Override
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }


    // =========================
    // GET ORDERS BY SELLER
    // SELLER DASHBOARD
    // =========================

    @Override
    public List<Order> getOrdersBySellerId(Long sellerId) {

        List<Order> sellerOrders = new ArrayList<>();

        // Get all products belonging to this seller
        List<Product> sellerProducts =
                productRepository.findBySellerId(sellerId);

        // Find orders for each seller product
        for (Product product : sellerProducts) {

            List<Order> productOrders =
                    orderRepository.findByProductId(product.getId());

            sellerOrders.addAll(productOrders);
        }

        return sellerOrders;
    }


    // =========================
    // UPDATE ORDER
    // =========================

    @Override
    public Order updateOrder(Long id, Order order) {

        Optional<Order> existingOrder =
                orderRepository.findById(id);

        if (existingOrder.isPresent()) {

            Order currentOrder =
                    existingOrder.get();

            currentOrder.setUserId(
                    order.getUserId()
            );

            currentOrder.setProductId(
                    order.getProductId()
            );

            currentOrder.setQuantity(
                    order.getQuantity()
            );

            currentOrder.setTotalPrice(
                    order.getTotalPrice()
            );

            currentOrder.setStatus(
                    order.getStatus()
            );

            return orderRepository.save(currentOrder);
        }

        throw new RuntimeException(
                "Order not found with ID: " + id
        );
    }


    // =========================
    // DELETE ORDER
    // =========================

    @Override
    public void deleteOrder(Long id) {

        if (!orderRepository.existsById(id)) {

            throw new RuntimeException(
                    "Order not found with ID: " + id
            );
        }

        orderRepository.deleteById(id);
    }
}