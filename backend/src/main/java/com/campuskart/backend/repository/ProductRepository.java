package com.campuskart.backend.repository;

import com.campuskart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByProductName(String productName);

    List<Product> findByCategory(String category);

    List<Product> findBySellerId(Long sellerId);
}