package com.campuskart.backend.dto;

import com.campuskart.backend.entity.CouponDiscountType;

public record CouponApplicationResponse(
        String couponCode,
        CouponDiscountType discountType,
        Double originalSubtotal,
        Double discountAmount,
        Double finalSubtotal,
        Double payableAmount) {
}