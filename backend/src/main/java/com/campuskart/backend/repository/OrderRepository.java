package com.campuskart.backend.repository;

import com.campuskart.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Get all orders by User ID
    List<Order> findByUserId(Long userId);

    // Get all orders by Product ID
    List<Order> findByProductId(Long productId);

    // Get all orders by Status
    List<Order> findByStatus(String status);

}