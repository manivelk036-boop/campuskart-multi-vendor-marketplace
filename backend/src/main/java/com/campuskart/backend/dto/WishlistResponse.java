package com.campuskart.backend.dto;

import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.Wishlist;

import java.time.LocalDateTime;

public record WishlistResponse(
        Long id,
        Long productId,
        String productName,
        String imageUrl,
        Double price,
        Integer quantity,
        String sellerName,
        LocalDateTime addedAt) {

    public static WishlistResponse from(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        String sellerName = product.getSeller() == null
                ? "CampusKart Seller"
                : product.getSeller().getFullName();
        return new WishlistResponse(
                wishlist.getId(),
                product.getId(),
                product.getProductName(),
                product.getImageUrl(),
                product.getPrice(),
                product.getQuantity(),
                sellerName,
                wishlist.getCreatedAt());
    }
}
