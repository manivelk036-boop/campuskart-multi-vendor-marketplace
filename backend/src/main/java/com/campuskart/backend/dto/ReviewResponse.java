package com.campuskart.backend.dto;

import com.campuskart.backend.entity.Review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long productId,
        Long userId,
        String reviewerName,
        Integer rating,
        String reviewText,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getProduct().getId(),
                review.getUser().getId(),
                review.getUser().getFullName(),
                review.getRating(),
                review.getReviewText(),
                review.getCreatedAt(),
                review.getUpdatedAt());
    }
}
