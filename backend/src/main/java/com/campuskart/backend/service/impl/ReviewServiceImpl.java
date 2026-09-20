package com.campuskart.backend.service.impl;

import com.campuskart.backend.dto.ProductReviewSummary;
import com.campuskart.backend.dto.ReviewRequest;
import com.campuskart.backend.dto.ReviewResponse;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.Review;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.repository.ReviewRepository;
import com.campuskart.backend.service.ReviewService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public ReviewServiceImpl(
            ReviewRepository reviewRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReviewSummary getProductReviews(Long productId) {
        requireProduct(productId);
        List<ReviewResponse> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(ReviewResponse::from)
                .toList();
        Double average = reviewRepository.averageRatingForProduct(productId);
        return new ProductReviewSummary(productId, average == null ? 0.0 : average, reviews.size(), reviews);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canCustomerReview(Long productId, User customer) {
        requireProduct(productId);
        requireCustomer(customer);
        return orderRepository.existsByUserIdAndProductId(customer.getId(), productId)
                && !reviewRepository.existsByProductIdAndUserId(productId, customer.getId());
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long productId, ReviewRequest request, User customer) {
        validateRequest(request);
        Product product = requireProduct(productId);
        requireCustomer(customer);

        if (!orderRepository.existsByUserIdAndProductId(customer.getId(), productId)) {
            throw new IllegalStateException("You can review a product only after purchasing it");
        }
        if (reviewRepository.existsByProductIdAndUserId(productId, customer.getId())) {
            throw new IllegalStateException("You have already reviewed this product");
        }

        Review review = new Review();
        review.setProduct(product);
        review.setUser(customer);
        applyRequest(review, request);
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, User customer) {
        validateRequest(request);
        Review review = requireReview(reviewId);
        requireOwner(review, customer);
        applyRequest(review, request);
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void deleteOwnReview(Long reviewId, User customer) {
        Review review = requireReview(reviewId);
        requireOwner(review, customer);
        reviewRepository.delete(review);
    }

    @Override
    @Transactional
    public void deleteAsAdmin(Long reviewId) {
        reviewRepository.delete(requireReview(reviewId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForSeller(Long sellerId) {
        return reviewRepository.findByProductSellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream().map(ReviewResponse::from).toList();
    }

    private Product requireProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
    }

    private Review requireReview(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));
    }

    private void requireCustomer(User user) {
        if (user == null || user.getId() == null || !"CUSTOMER".equalsIgnoreCase(user.getRole())) {
            throw new IllegalStateException("Only customers can submit reviews");
        }
    }

    private void requireOwner(Review review, User customer) {
        requireCustomer(customer);
        if (!customer.getId().equals(review.getUser().getId())) {
            throw new org.springframework.security.access.AccessDeniedException("You can only manage your own review");
        }
    }

    private void validateRequest(ReviewRequest request) {
        if (request == null || request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        if (request.getReviewText() != null && request.getReviewText().length() > 1000) {
            throw new IllegalArgumentException("Review must be 1000 characters or fewer");
        }
    }

    private void applyRequest(Review review, ReviewRequest request) {
        review.setRating(request.getRating());
        review.setReviewText(request.getReviewText() == null || request.getReviewText().isBlank()
                ? null
                : request.getReviewText().trim());
    }
}
