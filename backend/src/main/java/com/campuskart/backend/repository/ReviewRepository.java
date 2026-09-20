package com.campuskart.backend.repository;

import com.campuskart.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<Review> findByProductSellerIdOrderByCreatedAtDesc(Long sellerId);

    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    boolean existsByProductIdAndUserId(Long productId, Long userId);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.product.id = :productId")
    Double averageRatingForProduct(@Param("productId") Long productId);

    long countByProductId(Long productId);
}
