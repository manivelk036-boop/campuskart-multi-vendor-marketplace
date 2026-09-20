package com.campuskart.backend.dto;

import com.campuskart.backend.entity.CouponDiscountType;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class CouponRequest {
    @NotBlank
    private String code;
    @NotNull
    private CouponDiscountType discountType;
    @NotNull
    @Positive
    private Double discountValue;
    @NotNull
    @PositiveOrZero
    private Double minimumOrderAmount = 0.0;
    @PositiveOrZero
    private Double maximumDiscountAmount;
    @NotNull
    private LocalDateTime startAt;
    @NotNull
    private LocalDateTime expiresAt;
    @Positive
    private Integer usageLimit;
    private boolean active = true;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public CouponDiscountType getDiscountType() { return discountType; }
    public void setDiscountType(CouponDiscountType discountType) { this.discountType = discountType; }
    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }
    public Double getMinimumOrderAmount() { return minimumOrderAmount; }
    public void setMinimumOrderAmount(Double minimumOrderAmount) { this.minimumOrderAmount = minimumOrderAmount; }
    public Double getMaximumDiscountAmount() { return maximumDiscountAmount; }
    public void setMaximumDiscountAmount(Double maximumDiscountAmount) { this.maximumDiscountAmount = maximumDiscountAmount; }
    public LocalDateTime getStartAt() { return startAt; }
    public void setStartAt(LocalDateTime startAt) { this.startAt = startAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}