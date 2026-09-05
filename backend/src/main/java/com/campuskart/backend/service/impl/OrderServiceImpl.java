package com.campuskart.backend.service.impl;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public Order saveOrder(Order order) {

        Product product = order.getProductId() == null
                ? null
                : productRepository.findById(order.getProductId())
                        .orElse(null);

        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        if (order.getQuantity() == null
                || order.getQuantity() <= 0) {
            throw new RuntimeException(
                    "Order quantity must be greater than zero");
        }

        if (product.getQuantity() == null
                || order.getQuantity() > product.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        order.setTotalPrice(
                product.getPrice() * order.getQuantity()
        );

        if (order.getStatus() == null
                || order.getStatus().isBlank()) {
            order.setStatus("PENDING");
        }

        product.setQuantity(
                product.getQuantity() - order.getQuantity()
        );

        productRepository.save(product);
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

        List<Product> sellerProducts =
                productRepository.findBySellerId(sellerId);

        if (sellerProducts == null || sellerProducts.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> productIds = new ArrayList<>();
        for (Product product : sellerProducts) {
            productIds.add(product.getId());
        }

        return orderRepository.findByProductIdIn(productIds);
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
// UPDATE ORDER STATUS
// =========================

@Override
public Order updateOrderStatus(Long id, String status) {

    Order order = orderRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Order not found with ID: " + id
                    )
            );

    order.setStatus(status);

    return orderRepository.save(order);
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