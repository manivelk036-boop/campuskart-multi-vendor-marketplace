package com.campuskart.backend.service;

import com.campuskart.backend.entity.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {

    Product saveProduct(Product product);

    List<Product> getAllProducts();

    Optional<Product> getProductById(Long id);

    List<Product> getProductByName(String productName);

    List<Product> getProductsByCategory(String category);

    List<Product> getProductsBySeller(Long sellerId);

    Product updateProduct(Long id, Product updatedProduct);

    void deleteProduct(Long id);
}