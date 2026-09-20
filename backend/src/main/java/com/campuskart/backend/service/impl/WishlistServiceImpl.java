package com.campuskart.backend.service.impl;

import com.campuskart.backend.dto.WishlistResponse;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.entity.Wishlist;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.repository.WishlistRepository;
import com.campuskart.backend.service.WishlistService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public WishlistServiceImpl(
            WishlistRepository wishlistRepository,
            ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(User customer) {
        requireCustomer(customer);
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(WishlistResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public WishlistResponse addProduct(Long productId, User customer) {
        requireCustomer(customer);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (wishlistRepository.existsByUserIdAndProductId(customer.getId(), productId)) {
            throw new IllegalStateException("Product is already in your wishlist");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(customer);
        wishlist.setProduct(product);
        return WishlistResponse.from(wishlistRepository.save(wishlist));
    }

    @Override
    @Transactional
    public void removeProduct(Long productId, User customer) {
        requireCustomer(customer);
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(customer.getId(), productId)
                .orElseThrow(() -> new IllegalArgumentException("Product is not in your wishlist"));
        wishlistRepository.delete(wishlist);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean containsProduct(Long productId, User customer) {
        requireCustomer(customer);
        return wishlistRepository.existsByUserIdAndProductId(customer.getId(), productId);
    }

    private void requireCustomer(User customer) {
        if (customer == null || customer.getId() == null || !"CUSTOMER".equalsIgnoreCase(customer.getRole())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only customers can access a wishlist");
        }
    }
}
