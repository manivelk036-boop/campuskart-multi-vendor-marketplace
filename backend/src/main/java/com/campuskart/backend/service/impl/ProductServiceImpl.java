package com.campuskart.backend.service.impl;

import com.campuskart.backend.entity.Product;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.repository.ProductSpecifications;
import com.campuskart.backend.service.ProductService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    // CREATE
    @Override
    public Product saveProduct(Product product) {
        if (isBlank(product.getImageUrl())) {
            product.setImageUrl(resolveImageUrl(product));
        }

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
        return productRepository.findByCategory_Name(category);
    }

    // GET BY SELLER
    @Override
    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    @Override
    public Page<Product> searchProducts(String keyword,
                                         String category,
                                         Double minPrice,
                                         Double maxPrice,
                                         String sort,
                                         Pageable pageable) {
        Specification<Product> specification = (root, query, cb) -> cb.conjunction();

        Specification<Product> keywordSpec = ProductSpecifications.hasKeyword(keyword);
        if (keywordSpec != null) {
            specification = specification.and(keywordSpec);
        }

        Specification<Product> categorySpec = ProductSpecifications.hasCategory(category);
        if (categorySpec != null) {
            specification = specification.and(categorySpec);
        }

        if (minPrice != null) {
            specification = specification.and(ProductSpecifications.hasMinPrice(minPrice));
        }

        if (maxPrice != null) {
            specification = specification.and(ProductSpecifications.hasMaxPrice(maxPrice));
        }

        if (pageable == null) {
            pageable = PageRequest.of(0, 12);
        }

        Sort sortOption = switch (sort == null || sort.isBlank() ? "relevance" : sort.toLowerCase(Locale.ROOT)) {
            case "price-low-high" -> Sort.by("price").ascending();
            case "price-high-low" -> Sort.by("price").descending();
            case "newest-first" -> Sort.by("id").descending();
            default -> Sort.by("id").descending();
        };

        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sortOption);

        return productRepository.findAll(specification, sortedPageable);
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

        if (!isBlank(updatedProduct.getImageUrl())) {
            existingProduct.setImageUrl(updatedProduct.getImageUrl());
        } else if (isBlank(existingProduct.getImageUrl())) {
            existingProduct.setImageUrl(resolveImageUrl(updatedProduct));
        }

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

    @Override
    public Product updateImageUrl(Long id, String imageUrl) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setImageUrl(imageUrl);
        return productRepository.save(product);
    }

    private String resolveImageUrl(Product product) {
        String productText = product.getProductName() == null
                ? ""
                : product.getProductName().toLowerCase(Locale.ROOT);

        String categoryText = product.getCategory() == null
                || product.getCategory().getName() == null
                ? ""
                : product.getCategory().getName().toLowerCase(Locale.ROOT);

        String searchableText = productText + " " + categoryText;

        if (searchableText.contains("airpod")
                || searchableText.contains("earbud")
                || searchableText.contains("headphone")) {
            return "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=85";
        }

        if (searchableText.contains("keyboard")) {
            return "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=85";
        }

        if (searchableText.contains("fan")) {
            return "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=900&q=85";
        }

        if (searchableText.contains("note")
                || searchableText.contains("notebook")
                || searchableText.contains("stationery")) {
            return "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=900&q=85";
        }

        if (searchableText.contains("mouse")) {
            return "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85";
        }

        return "https://placehold.co/900x700/eef0ff/5b5bd6?text=CampusKart+Product";
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
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