package com.campuskart.backend.service.impl;

import com.campuskart.backend.dto.ApplyCouponRequest;
import com.campuskart.backend.dto.CartItemRequest;
import com.campuskart.backend.dto.CouponApplicationResponse;
import com.campuskart.backend.dto.CouponRequest;
import com.campuskart.backend.entity.Coupon;
import com.campuskart.backend.entity.CouponDiscountType;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.repository.CouponRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class CouponServiceImpl implements CouponService {

    @Autowired private CouponRepository couponRepository;
    @Autowired private ProductRepository productRepository;

    @Override
    @Transactional
    public Coupon create(CouponRequest request, Long adminId) {
        validateRequest(request);
        String code = normalize(request.getCode());
        if (couponRepository.existsByCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("Coupon code already exists");
        }
        Coupon coupon = new Coupon();
        copy(request, coupon);
        coupon.setCode(code);
        coupon.setCreatedBy(adminId);
        try {
            return couponRepository.save(coupon);
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalArgumentException("Coupon code already exists", ex);
        }
    }

    @Override public List<Coupon> getAll() { return couponRepository.findAll(); }

    @Override
    public Coupon getById(Long id) {
        return couponRepository.findById(id).orElseThrow(() -> new RuntimeException("Coupon not found"));
    }

    @Override
    @Transactional
    public Coupon update(Long id, CouponRequest request) {
        validateRequest(request);
        Coupon coupon = getById(id);
        String code = normalize(request.getCode());
        couponRepository.findByCodeIgnoreCase(code).ifPresent(existing -> {
            if (!existing.getId().equals(id)) throw new IllegalArgumentException("Coupon code already exists");
        });
        copy(request, coupon);
        coupon.setCode(code);
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() > coupon.getUsageLimit()) {
            throw new IllegalArgumentException("Usage limit cannot be below used count");
        }
        return couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public Coupon setActive(Long id, boolean active) {
        Coupon coupon = getById(id);
        coupon.setActive(active);
        return couponRepository.save(coupon);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!couponRepository.existsById(id)) throw new RuntimeException("Coupon not found");
        couponRepository.deleteById(id);
    }

    @Override
    public CouponApplicationResponse apply(ApplyCouponRequest request) {
        CouponCalculation calculation = calculate(request.getCode(), request);
        return new CouponApplicationResponse(
                calculation.coupon().getCode(), calculation.coupon().getDiscountType(),
                calculation.originalSubtotal(), calculation.discountAmount(),
                calculation.finalSubtotal(), calculation.finalSubtotal());
    }

    @Override
    public CouponCalculation calculate(String code, ApplyCouponRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalize(code))
                .orElseThrow(() -> new IllegalArgumentException("Invalid coupon code"));
        validateUsable(coupon);
        double subtotal = 0.0;
        for (CartItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));
            if (item.getQuantity() <= 0 || product.getQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for coupon calculation");
            }
            subtotal += product.getPrice() * item.getQuantity();
        }
        if (subtotal < coupon.getMinimumOrderAmount()) {
            throw new IllegalArgumentException("Minimum order amount for this coupon is " + coupon.getMinimumOrderAmount());
        }
        double discount = coupon.getDiscountType() == CouponDiscountType.PERCENTAGE
                ? subtotal * coupon.getDiscountValue() / 100.0
                : coupon.getDiscountValue();
        if (coupon.getMaximumDiscountAmount() != null) {
            discount = Math.min(discount, coupon.getMaximumDiscountAmount());
        }
        discount = round(Math.min(Math.max(discount, 0.0), subtotal));
        return new CouponCalculation(coupon, round(subtotal), discount, round(subtotal - discount));
    }

    @Override
    @Transactional
    public void claimUsage(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalize(code))
                .orElseThrow(() -> new IllegalArgumentException("Invalid coupon code"));
        validateUsable(coupon);
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    private void validateRequest(CouponRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) throw new IllegalArgumentException("Coupon code is required");
        if (request.getDiscountType() == null || request.getDiscountValue() == null || request.getDiscountValue() <= 0) throw new IllegalArgumentException("Discount value must be greater than zero");
        if (request.getDiscountType() == CouponDiscountType.PERCENTAGE && request.getDiscountValue() > 100) throw new IllegalArgumentException("Percentage discount cannot exceed 100");
        if (request.getMinimumOrderAmount() == null || request.getMinimumOrderAmount() < 0) throw new IllegalArgumentException("Minimum order amount cannot be negative");
        if (request.getMaximumDiscountAmount() != null && request.getMaximumDiscountAmount() < 0) throw new IllegalArgumentException("Maximum discount amount cannot be negative");
        if (request.getStartAt() == null || request.getExpiresAt() == null || !request.getExpiresAt().isAfter(request.getStartAt())) throw new IllegalArgumentException("Expiry must be after start date");
        if (request.getUsageLimit() != null && request.getUsageLimit() <= 0) throw new IllegalArgumentException("Usage limit must be greater than zero");
    }

    private void validateUsable(Coupon coupon) {
        LocalDateTime now = LocalDateTime.now();
        if (!coupon.isActive()) throw new IllegalArgumentException("Coupon is inactive");
        if (now.isBefore(coupon.getStartAt()) || !now.isBefore(coupon.getExpiresAt())) throw new IllegalArgumentException("Coupon is expired or not active yet");
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) throw new IllegalArgumentException("Coupon usage limit reached");
    }

    private void copy(CouponRequest request, Coupon coupon) {
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinimumOrderAmount(request.getMinimumOrderAmount());
        coupon.setMaximumDiscountAmount(request.getMaximumDiscountAmount());
        coupon.setStartAt(request.getStartAt());
        coupon.setExpiresAt(request.getExpiresAt());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setActive(request.isActive());
    }

    private String normalize(String code) { return code == null ? "" : code.trim().toUpperCase(Locale.ROOT); }
    private double round(double value) { return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue(); }
}