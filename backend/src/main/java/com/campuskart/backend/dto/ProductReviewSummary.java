package com.campuskart.backend.dto;

import java.util.List;

public record ProductReviewSummary(
        Long productId,
        double averageRating,
        long reviewCount,
        List<ReviewResponse> reviews) {
}
