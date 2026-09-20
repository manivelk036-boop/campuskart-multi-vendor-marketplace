package com.campuskart.backend.service;

import com.campuskart.backend.dto.ProductReviewSummary;
import com.campuskart.backend.dto.ReviewRequest;
import com.campuskart.backend.dto.ReviewResponse;
import com.campuskart.backend.entity.User;

import java.util.List;

public interface ReviewService {

    ProductReviewSummary getProductReviews(Long productId);

    boolean canCustomerReview(Long productId, User customer);

    ReviewResponse createReview(Long productId, ReviewRequest request, User customer);

    ReviewResponse updateReview(Long reviewId, ReviewRequest request, User customer);

    void deleteOwnReview(Long reviewId, User customer);

    void deleteAsAdmin(Long reviewId);

    List<ReviewResponse> getReviewsForSeller(Long sellerId);

    List<ReviewResponse> getAllReviews();
}
