package com.campuskart.backend.controller;

import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.UserRepository;
import com.campuskart.backend.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    // =========================
    // CREATE PRODUCT FOR SELLER
    // =========================

    @PostMapping("/seller/{sellerId}")
    public Product createProduct(
            @PathVariable Long sellerId,
            @RequestBody Product product) {

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() ->
                        new RuntimeException("Seller not found"));

        if (!"SELLER".equals(seller.getRole())) {
            throw new RuntimeException(
                    "Only SELLER users can create products"
            );
        }

        product.setSeller(seller);

        return productService.saveProduct(product);
    }

    // =========================
    // GET ALL PRODUCTS
    // CUSTOMER HOME PAGE
    // =========================

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // =========================
    // GET PRODUCTS BY SELLER
    // SELLER DASHBOARD
    // =========================

    @GetMapping("/seller/{sellerId}")
    public List<Product> getProductsBySeller(
            @PathVariable Long sellerId) {

        return productService.getProductsBySeller(sellerId);
    }

    // =========================
    // GET PRODUCT BY ID
    // =========================

    @GetMapping("/{id}")
    public Optional<Product> getProductById(
            @PathVariable Long id) {

        return productService.getProductById(id);
    }

    // =========================
    // GET PRODUCTS BY NAME
    // =========================

    @GetMapping("/name/{productName}")
    public List<Product> getProductByName(
            @PathVariable String productName) {

        return productService.getProductByName(productName);
    }

    // =========================
    // GET PRODUCTS BY CATEGORY
    // =========================

    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(
            @PathVariable String category) {

        return productService.getProductsByCategory(category);
    }

    // =========================
    // UPDATE PRODUCT
    // =========================

    @PutMapping("/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {

        return productService.updateProduct(id, product);
    }

    // =========================
    // DELETE PRODUCT
    // =========================

    @DeleteMapping("/{id}")
    public String deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return "Product deleted successfully!";
    }
}