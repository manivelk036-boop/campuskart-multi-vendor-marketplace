package com.campuskart.backend.controller;

import com.campuskart.backend.dto.ProductReviewSummary;
import com.campuskart.backend.dto.ReviewRequest;
import com.campuskart.backend.dto.ReviewResponse;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@Tag(name = "Reviews", description = "Product review and rating endpoints")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @Operation(summary = "List ratings and reviews for a product")
    @GetMapping("/product/{productId}")
    public ProductReviewSummary getProductReviews(@PathVariable Long productId) {
        return reviewService.getProductReviews(productId);
    }

    @Operation(summary = "Check whether the authenticated customer can review a product")
    @GetMapping("/product/{productId}/eligibility")
    @PreAuthorize("hasRole('CUSTOMER')")
    public java.util.Map<String, Boolean> getReviewEligibility(
            @PathVariable Long productId,
            Authentication authentication) {
        return java.util.Map.of("eligible", reviewService.canCustomerReview(
                productId, currentUser(authentication)));
    }

    @Operation(summary = "Submit a review for a purchased product")
    @PostMapping("/product/{productId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ReviewResponse createReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        return reviewService.createReview(productId, request, currentUser(authentication));
    }

    @Operation(summary = "Edit the authenticated customer's review")
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ReviewResponse updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        return reviewService.updateReview(reviewId, request, currentUser(authentication));
    }

    @Operation(summary = "Delete the authenticated customer's review")
    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteOwnReview(
            @PathVariable Long reviewId,
            Authentication authentication) {
        reviewService.deleteOwnReview(reviewId, currentUser(authentication));
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "List reviews for a seller's products")
    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SELLER')")
    public List<ReviewResponse> getSellerReviews(
            @PathVariable Long sellerId,
            Authentication authentication) {
        if (hasRole(authentication, "ROLE_SELLER")
                && !currentUser(authentication).getId().equals(sellerId)) {
            throw new AccessDeniedException("You can only view reviews for your own products");
        }
        return reviewService.getReviewsForSeller(sellerId);
    }

    @Operation(summary = "List all reviews as an administrator")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ReviewResponse> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @Operation(summary = "Delete a review as an administrator")
    @DeleteMapping("/admin/{reviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAsAdmin(@PathVariable Long reviewId) {
        reviewService.deleteAsAdmin(reviewId);
        return ResponseEntity.noContent().build();
    }

    private User currentUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }
}
