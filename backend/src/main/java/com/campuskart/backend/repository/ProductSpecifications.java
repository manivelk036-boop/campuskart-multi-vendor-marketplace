package com.campuskart.backend.repository;

import com.campuskart.backend.entity.Product;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> hasKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }

        String normalizedKeyword = keyword.trim().toLowerCase(Locale.ROOT);
        String wildcardKeyword = "%" + normalizedKeyword + "%";

        return (root, query, cb) -> {
            Join<Object, Object> categoryJoin = root.join("category", JoinType.LEFT);

            Predicate byProductName = cb.like(
                    cb.lower(root.get("productName")),
                    wildcardKeyword
            );

            Predicate byDescription = cb.like(
                    cb.lower(cb.coalesce(root.get("description"), "")),
                    wildcardKeyword
            );

            Predicate byCategory = cb.like(
                    cb.lower(categoryJoin.get("name")),
                    wildcardKeyword
            );

            return cb.or(byProductName, byDescription, byCategory);
        };
    }

    public static Specification<Product> hasCategory(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }

        String normalizedCategory = category.trim().toLowerCase(Locale.ROOT);

        return (root, query, cb) -> {
            Join<Object, Object> categoryJoin = root.join("category", JoinType.LEFT);
            return cb.equal(cb.lower(categoryJoin.get("name")), normalizedCategory);
        };
    }

    public static Specification<Product> hasMinPrice(Double minPrice) {
        if (minPrice == null) {
            return null;
        }

        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice);
    }

    public static Specification<Product> hasMaxPrice(Double maxPrice) {
        if (maxPrice == null) {
            return null;
        }

        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice);
    }
}
