package com.campuskart.backend.service.impl;

import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.ProductImage;
import com.campuskart.backend.repository.ProductImageRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.ProductImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;

@Service
public class ProductImageServiceImpl implements ProductImageService {

    @Autowired private ProductImageRepository imageRepository;
    @Autowired private ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductImage> getImages(Long productId) {
        requireProduct(productId);
        return imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(productId);
    }

    @Override
    @Transactional
    public ProductImage addImage(Long productId, String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) throw new IllegalArgumentException("Image URL is required");
        Product product = requireProduct(productId);
        List<ProductImage> existing = imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(productId);
        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(imageUrl.trim());
        image.setDisplayOrder(existing.size());
        return imageRepository.save(image);
    }

    @Override
    @Transactional
    public void deleteImage(Long productId, Long imageId) {
        ProductImage image = requireOwnedImage(productId, imageId);
        imageRepository.delete(image);
        normalizeOrder(productId);
    }

    @Override
    @Transactional
    public ProductImage reorderImage(Long productId, Long imageId, int displayOrder) {
        if (displayOrder < 0) throw new IllegalArgumentException("Display order cannot be negative");
        ProductImage image = requireOwnedImage(productId, imageId);
        List<ProductImage> images = new ArrayList<>(imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(productId));
        images.remove(image);
        int target = Math.min(displayOrder, images.size());
        images.add(target, image);
        for (int index = 0; index < images.size(); index++) images.get(index).setDisplayOrder(index);
        imageRepository.saveAll(images);
        return image;
    }

    private ProductImage requireOwnedImage(Long productId, Long imageId) {
        ProductImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Product image not found"));
        if (image.getProduct() == null || !productId.equals(image.getProduct().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Image does not belong to this product");
        }
        return image;
    }

    private void normalizeOrder(Long productId) {
        List<ProductImage> images = imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(productId);
        for (int index = 0; index < images.size(); index++) images.get(index).setDisplayOrder(index);
        imageRepository.saveAll(images);
    }

    private Product requireProduct(Long productId) {
        return productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));
    }
}