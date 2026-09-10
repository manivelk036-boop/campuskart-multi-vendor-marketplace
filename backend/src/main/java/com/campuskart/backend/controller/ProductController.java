package com.campuskart.backend.controller;

import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.Category;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.CategoryRepository;
import com.campuskart.backend.repository.UserRepository;
import com.campuskart.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Product catalog, seller catalog management, and product discovery endpoints")
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

    @Autowired
    private CategoryRepository categoryRepository;

    // =========================
    // CREATE PRODUCT FOR SELLER
    // =========================

    @Operation(summary = "Create a new product for an authenticated seller")
    @PostMapping("/seller/{sellerId}")
    @PreAuthorize("hasRole('SELLER')")
    public Product createProduct(
            @PathVariable Long sellerId,
            @RequestBody Product product,
            Authentication authentication) {

        User authenticatedUser = (User) authentication.getPrincipal();
        if (!authenticatedUser.getId().equals(sellerId)) {
            throw new AccessDeniedException(
                    "You can only create products for your own seller account");
        }

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() ->
                        new RuntimeException("Seller not found"));

        if (!"SELLER".equals(seller.getRole())) {
            throw new RuntimeException(
                    "Only SELLER users can create products"
            );
        }

        product.setCategory(resolveCategory(product));
        product.setSeller(seller);

        return productService.saveProduct(product);
    }

    // =========================
    // GET ALL PRODUCTS
    // CUSTOMER HOME PAGE
    // =========================

    @Operation(summary = "List all products for the store front")
    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    // =========================
    // GET PRODUCTS BY SELLER
    // SELLER DASHBOARD
    // =========================

    @Operation(summary = "List products owned by a specific seller")
    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public List<Product> getProductsBySeller(
            @PathVariable Long sellerId,
            Authentication authentication) {

        requireAdminOrOwnSellerProducts(sellerId, authentication);

        return productService.getProductsBySeller(sellerId);
    }

    // =========================
    // GET PRODUCT BY ID
    // =========================

    @Operation(summary = "Fetch a product by identifier")
    @GetMapping("/{id}")
    public Optional<Product> getProductById(
            @PathVariable Long id) {

        return productService.getProductById(id);
    }

    // =========================
    // GET PRODUCTS BY NAME
    // =========================

    @Operation(summary = "Search products by product name")
    @GetMapping("/name/{productName}")
    public List<Product> getProductByName(
            @PathVariable String productName) {

        return productService.getProductByName(productName);
    }

    // =========================
    // GET PRODUCTS BY CATEGORY
    // =========================

    @Operation(summary = "Browse products by category")
    @GetMapping("/category/{category}")
    public List<Product> getProductsByCategory(
            @PathVariable String category) {

        return productService.getProductsByCategory(category);
    }

    // =========================
    // UPDATE PRODUCT
    // =========================

    @Operation(summary = "Update a product as an admin or owning seller")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            Authentication authentication) {

        requireAdminOrProductOwner(id, authentication);

        product.setCategory(resolveCategory(product));

        return productService.updateProduct(id, product);
    }

    // =========================
    // DELETE PRODUCT
    // =========================

    @Operation(summary = "Delete a product as an admin or owning seller")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public String deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {

        requireAdminOrProductOwner(id, authentication);

        productService.deleteProduct(id);

        return "Product deleted successfully!";
    }

    private void requireAdminOrProductOwner(
            Long productId,
            Authentication authentication) {

        if (authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        "ROLE_ADMIN".equals(authority.getAuthority()))) {
            return;
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        Product product = productService.getProductById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        if (product.getSeller() == null
                || !authenticatedUser.getId().equals(product.getSeller().getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You can only manage your own products");
        }
    }

    private void requireAdminOrOwnSellerProducts(
            Long sellerId,
            Authentication authentication) {

        if (authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        "ROLE_ADMIN".equals(authority.getAuthority()))) {
            return;
        }

        User authenticatedUser = (User) authentication.getPrincipal();
        if (!authenticatedUser.getId().equals(sellerId)) {
            throw new AccessDeniedException(
                    "You can only access your own products");
        }
    }

    private Category resolveCategory(
            Product product) {

        if (product.getCategory() == null
                || product.getCategory().getName() == null
                || product.getCategory().getName().isBlank()) {
            throw new IllegalArgumentException("Category is required");
        }

        String categoryName = product.getCategory().getName().trim();

        return categoryRepository.findByNameIgnoreCase(categoryName)
            .orElseGet(() -> categoryRepository.save(
                new Category(null, categoryName)));
    }
}