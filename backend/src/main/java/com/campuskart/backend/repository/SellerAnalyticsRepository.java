package com.campuskart.backend.repository;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SellerAnalyticsRepository {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public SellerAnalyticsRepository(ProductRepository productRepository,
                                     OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public List<Product> findProductsBySellerId(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    public List<Order> findOrdersByProductIds(List<Long> productIds) {
        return productIds.isEmpty() ? List.of() : orderRepository.findByProductIdIn(productIds);
    }
}