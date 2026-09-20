package com.campuskart.backend.service;

import com.campuskart.backend.entity.ProductImage;

import java.util.List;

public interface ProductImageService {
    List<ProductImage> getImages(Long productId);
    ProductImage addImage(Long productId, String imageUrl);
    void deleteImage(Long productId, Long imageId);
    ProductImage reorderImage(Long productId, Long imageId, int displayOrder);
}