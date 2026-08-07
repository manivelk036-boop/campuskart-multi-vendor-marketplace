package com.campuskart.backend.service;

import com.campuskart.backend.entity.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {

    // Create Product
    Product saveProduct(Product product);

    // Get All Products
    List<Product> getAllProducts();

    // Get Product By ID
    Optional<Product> getProductById(Long id);

    // Get Product By Name
    List<Product> getProductByName(String productName);

    // Get Products By Category
    List<Product> getProductsByCategory(String category);

    // Update Product
    Product updateProduct(Long id, Product updatedProduct);

    // Delete Product
    void deleteProduct(Long id);
}