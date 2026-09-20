package com.campuskart.backend;

import com.campuskart.backend.dto.ApplyCouponRequest;
import com.campuskart.backend.dto.CartItemRequest;
import com.campuskart.backend.dto.CouponRequest;
import com.campuskart.backend.entity.Coupon;
import com.campuskart.backend.entity.CouponDiscountType;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.repository.CouponRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.impl.CouponServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceImplTest {

    @Mock private CouponRepository couponRepository;
    @Mock private ProductRepository productRepository;
    @InjectMocks private CouponServiceImpl couponService;

    @Test
    void percentageDiscountHonorsMaximumDiscount() {
        Coupon coupon = coupon(CouponDiscountType.PERCENTAGE, 20.0);
        coupon.setMaximumDiscountAmount(100.0);
        givenCoupon(coupon);

        var result = couponService.apply(request("save20", 1, 1000.0));

        assertEquals(1000.0, result.originalSubtotal());
        assertEquals(100.0, result.discountAmount());
        assertEquals(900.0, result.payableAmount());
    }

    @Test
    void fixedDiscountIsCalculatedFromCurrentProductPrice() {
        Coupon coupon = coupon(CouponDiscountType.FIXED, 150.0);
        givenCoupon(coupon);

        var result = couponService.apply(request("flat150", 2, 500.0));

        assertEquals(2000.0, result.originalSubtotal());
        assertEquals(150.0, result.discountAmount());
        assertEquals(1850.0, result.finalSubtotal());
    }

    @Test
    void minimumOrderAmountIsEnforced() {
        Coupon coupon = coupon(CouponDiscountType.FIXED, 10.0);
        coupon.setMinimumOrderAmount(1500.0);
        givenCoupon(coupon);

        assertThrows(IllegalArgumentException.class, () -> couponService.apply(request("minimum", 1, 1000.0)));
    }

    @Test
    void expiredInactiveAndUsedUpCouponsAreRejected() {
        Coupon coupon = coupon(CouponDiscountType.FIXED, 10.0);
        coupon.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        when(couponRepository.findByCodeIgnoreCase(any())).thenReturn(Optional.of(coupon));
        assertThrows(IllegalArgumentException.class, () -> couponService.apply(request("expired", 1, 100.0)));

        coupon.setExpiresAt(LocalDateTime.now().plusHours(1));
        coupon.setActive(false);
        assertThrows(IllegalArgumentException.class, () -> couponService.apply(request("inactive", 1, 100.0)));

        coupon.setActive(true);
        coupon.setUsageLimit(1);
        coupon.setUsedCount(1);
        assertThrows(IllegalArgumentException.class, () -> couponService.apply(request("used", 1, 100.0)));
    }

    @Test
    void invalidPercentageAndFixedValuesAreRejected() {
        CouponRequest percentage = validRequest();
        percentage.setDiscountType(CouponDiscountType.PERCENTAGE);
        percentage.setDiscountValue(101.0);
        assertThrows(IllegalArgumentException.class, () -> couponService.create(percentage, 1L));

        CouponRequest fixed = validRequest();
        fixed.setDiscountType(CouponDiscountType.FIXED);
        fixed.setDiscountValue(0.0);
        assertThrows(IllegalArgumentException.class, () -> couponService.create(fixed, 1L));
    }

    @Test
    void duplicateCodeIsRejectedCaseInsensitively() {
        CouponRequest request = validRequest();
        when(couponRepository.existsByCodeIgnoreCase("WELCOME")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> couponService.create(request, 5L));
    }

    private void givenCoupon(Coupon coupon) {
        when(couponRepository.findByCodeIgnoreCase(any())).thenReturn(Optional.of(coupon));
        Product product = new Product();
        product.setPrice(1000.0);
        product.setQuantity(20);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
    }

    private ApplyCouponRequest request(String code, int quantity, double ignoredClientPrice) {
        ApplyCouponRequest request = new ApplyCouponRequest();
        request.setCode(code);
        CartItemRequest item = new CartItemRequest();
        item.setProductId(1L);
        item.setQuantity(quantity);
        request.setItems(List.of(item));
        return request;
    }

    private Coupon coupon(CouponDiscountType type, double value) {
        Coupon coupon = new Coupon();
        coupon.setCode("TEST");
        coupon.setDiscountType(type);
        coupon.setDiscountValue(value);
        coupon.setMinimumOrderAmount(0.0);
        coupon.setStartAt(LocalDateTime.now().minusHours(1));
        coupon.setExpiresAt(LocalDateTime.now().plusHours(1));
        coupon.setUsedCount(0);
        coupon.setActive(true);
        return coupon;
    }

    private CouponRequest validRequest() {
        CouponRequest request = new CouponRequest();
        request.setCode("WELCOME");
        request.setDiscountType(CouponDiscountType.FIXED);
        request.setDiscountValue(10.0);
        request.setMinimumOrderAmount(0.0);
        request.setStartAt(LocalDateTime.now());
        request.setExpiresAt(LocalDateTime.now().plusDays(1));
        return request;
    }
}