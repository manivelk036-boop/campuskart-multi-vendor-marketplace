package com.campuskart.backend;

import com.campuskart.backend.dto.ProductReviewSummary;
import com.campuskart.backend.dto.ReviewRequest;
import com.campuskart.backend.dto.ReviewResponse;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.Review;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.repository.ReviewRepository;
import com.campuskart.backend.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private Product product;
    private User customer;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(10L);
        product.setProductName("Keyboard");

        customer = new User();
        customer.setId(7L);
        customer.setFullName("Demo Customer");
        customer.setRole("CUSTOMER");
    }

    @Test
    void customerCanReviewPurchasedProduct() {
        ReviewRequest request = request(5, "Excellent");
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(orderRepository.existsByUserIdAndProductId(7L, 10L)).thenReturn(true);
        when(reviewRepository.existsByProductIdAndUserId(10L, 7L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReviewResponse response = reviewService.createReview(10L, request, customer);

        assertEquals(5, response.rating());
        assertEquals("Excellent", response.reviewText());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void customerCannotReviewProductTheyDidNotPurchase() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(orderRepository.existsByUserIdAndProductId(7L, 10L)).thenReturn(false);

        assertThrows(IllegalStateException.class,
                () -> reviewService.createReview(10L, request(4, "Good"), customer));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void duplicateReviewIsRejected() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(orderRepository.existsByUserIdAndProductId(7L, 10L)).thenReturn(true);
        when(reviewRepository.existsByProductIdAndUserId(10L, 7L)).thenReturn(true);

        assertThrows(IllegalStateException.class,
                () -> reviewService.createReview(10L, request(4, "Good"), customer));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void ratingValidationRejectsValuesOutsideOneToFive() {
        assertThrows(IllegalArgumentException.class,
                () -> reviewService.createReview(10L, request(6, "Too high"), customer));
        verify(productRepository, never()).findById(any());
    }

    @Test
    void customerCanEditOwnReview() {
        Review review = review(20L, customer, 3, "Okay");
        when(reviewRepository.findById(20L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(review)).thenReturn(review);

        ReviewResponse response = reviewService.updateReview(20L, request(5, "Updated"), customer);

        assertEquals(5, response.rating());
        assertEquals("Updated", response.reviewText());
        verify(reviewRepository).save(review);
    }

    @Test
    void customerCannotEditAnotherUsersReview() {
        User otherCustomer = new User();
        otherCustomer.setId(8L);
        otherCustomer.setRole("CUSTOMER");
        Review review = review(20L, otherCustomer, 3, "Okay");
        when(reviewRepository.findById(20L)).thenReturn(Optional.of(review));

        assertThrows(AccessDeniedException.class,
                () -> reviewService.updateReview(20L, request(5, "Updated"), customer));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void productRatingAndCountAreCalculatedFromReviews() {
        Review first = review(1L, customer, 5, "Great");
        User otherCustomer = new User();
        otherCustomer.setId(8L);
        otherCustomer.setFullName("Other Customer");
        Review second = review(2L, otherCustomer, 3, "Fine");
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(reviewRepository.findByProductIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(first, second));
        when(reviewRepository.averageRatingForProduct(10L)).thenReturn(4.0);

        ProductReviewSummary summary = reviewService.getProductReviews(10L);

        assertEquals(4.0, summary.averageRating());
        assertEquals(2, summary.reviewCount());
        assertEquals(2, summary.reviews().size());
    }

    private ReviewRequest request(int rating, String text) {
        ReviewRequest request = new ReviewRequest();
        request.setRating(rating);
        request.setReviewText(text);
        return request;
    }

    private Review review(Long id, User user, int rating, String text) {
        Review review = new Review();
        review.setId(id);
        review.setProduct(product);
        review.setUser(user);
        review.setRating(rating);
        review.setReviewText(text);
        return review;
    }
}
