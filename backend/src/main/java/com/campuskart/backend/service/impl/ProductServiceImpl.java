package com.campuskart.backend.service.impl;

import com.campuskart.backend.entity.Product;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    // CREATE
    @Override
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    // GET ALL
    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // GET BY ID
    @Override
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // GET BY NAME
    @Override
    public List<Product> getProductByName(String productName) {
        return productRepository.findByProductName(productName);
    }

    // GET BY CATEGORY
    @Override
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    // GET BY SELLER
    @Override
    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    // UPDATE
    @Override
    public Product updateProduct(Long id, Product updatedProduct) {

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        existingProduct.setProductName(
                updatedProduct.getProductName()
        );

        existingProduct.setDescription(
                updatedProduct.getDescription()
        );

        existingProduct.setPrice(
                updatedProduct.getPrice()
        );

        existingProduct.setQuantity(
                updatedProduct.getQuantity()
        );

        existingProduct.setCategory(
                updatedProduct.getCategory()
        );

        return productRepository.save(existingProduct);
    }

    // DELETE
    @Override
    public void deleteProduct(Long id) {

        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found");
        }

        productRepository.deleteById(id);
    }
}