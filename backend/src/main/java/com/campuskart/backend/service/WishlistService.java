package com.campuskart.backend.service;

import com.campuskart.backend.dto.WishlistResponse;
import com.campuskart.backend.entity.User;

import java.util.List;

public interface WishlistService {

    List<WishlistResponse> getWishlist(User customer);

    WishlistResponse addProduct(Long productId, User customer);

    void removeProduct(Long productId, User customer);

    boolean containsProduct(Long productId, User customer);
}
