package com.campuskart.backend.service;

import com.campuskart.backend.dto.ApplyCouponRequest;
import com.campuskart.backend.dto.CouponApplicationResponse;
import com.campuskart.backend.dto.CouponRequest;
import com.campuskart.backend.entity.Coupon;

import java.util.List;

public interface CouponService {
    Coupon create(CouponRequest request, Long adminId);
    List<Coupon> getAll();
    Coupon getById(Long id);
    Coupon update(Long id, CouponRequest request);
    Coupon setActive(Long id, boolean active);
    void delete(Long id);
    CouponApplicationResponse apply(ApplyCouponRequest request);
    CouponCalculation calculate(String code, ApplyCouponRequest request);
    void claimUsage(String code);

    record CouponCalculation(Coupon coupon, double originalSubtotal, double discountAmount, double finalSubtotal) {}
}