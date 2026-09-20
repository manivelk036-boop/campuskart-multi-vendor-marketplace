package com.campuskart.backend.controller;

import com.campuskart.backend.dto.ApplyCouponRequest;
import com.campuskart.backend.dto.CouponApplicationResponse;
import com.campuskart.backend.dto.CouponRequest;
import com.campuskart.backend.entity.Coupon;
import com.campuskart.backend.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class CouponController {
    @Autowired private CouponService couponService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Coupon create(@Valid @RequestBody CouponRequest request, Authentication authentication) {
        return couponService.create(request, ((com.campuskart.backend.entity.User) authentication.getPrincipal()).getId());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Coupon> getAll() { return couponService.getAll(); }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Coupon getById(@PathVariable Long id) { return couponService.getById(id); }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Coupon update(@PathVariable Long id, @Valid @RequestBody CouponRequest request) { return couponService.update(id, request); }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public Coupon setActive(@PathVariable Long id, @RequestBody Map<String, Boolean> body) { return couponService.setActive(id, Boolean.TRUE.equals(body.get("active"))); }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) { couponService.delete(id); return ResponseEntity.noContent().build(); }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('CUSTOMER')")
    public CouponApplicationResponse apply(@Valid @RequestBody ApplyCouponRequest request) { return couponService.apply(request); }

    @PostMapping("/remove")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> remove() { return ResponseEntity.noContent().build(); }
}