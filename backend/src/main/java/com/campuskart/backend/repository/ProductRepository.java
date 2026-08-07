package com.campuskart.backend.repository;

import com.campuskart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find Product by Name
    List<Product> findByProductName(String productName);

    // Find Products by Category
    List<Product> findByCategory(String category);

}