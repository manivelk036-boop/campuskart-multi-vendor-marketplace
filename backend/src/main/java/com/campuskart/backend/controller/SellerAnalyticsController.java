package com.campuskart.backend.controller;

import com.campuskart.backend.dto.SellerAnalyticsDtos;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.service.SellerAnalyticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
@PreAuthorize("hasRole('SELLER')")
public class SellerAnalyticsController {

    private final SellerAnalyticsService analyticsService;

    public SellerAnalyticsController(SellerAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public SellerAnalyticsDtos.Summary summary(Authentication authentication) {
        return analyticsService.getSummary(currentSeller(authentication));
    }

    @GetMapping("/dashboard")
    public SellerAnalyticsDtos.Dashboard dashboard(Authentication authentication) {
        return analyticsService.getDashboard(currentSeller(authentication));
    }

    @GetMapping("/sales-trend")
    public List<SellerAnalyticsDtos.SalesTrend> salesTrend(
            @RequestParam(defaultValue = "daily") String period,
            Authentication authentication) {
        return analyticsService.getSalesTrend(currentSeller(authentication), period);
    }

    @GetMapping("/top-products")
    public List<SellerAnalyticsDtos.TopProduct> topProducts(Authentication authentication) {
        return analyticsService.getTopProducts(currentSeller(authentication));
    }

    @GetMapping("/low-stock")
    public List<SellerAnalyticsDtos.LowStockProduct> lowStock(Authentication authentication) {
        return analyticsService.getLowStockProducts(currentSeller(authentication));
    }

    @GetMapping("/recent-sales")
    public List<SellerAnalyticsDtos.RecentSale> recentSales(Authentication authentication) {
        return analyticsService.getRecentSales(currentSeller(authentication));
    }

    private Long currentSeller(Authentication authentication) {
        return ((User) authentication.getPrincipal()).getId();
    }
}