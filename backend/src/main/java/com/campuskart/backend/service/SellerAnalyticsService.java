package com.campuskart.backend.service;

import com.campuskart.backend.dto.SellerAnalyticsDtos;

public interface SellerAnalyticsService {

    SellerAnalyticsDtos.Summary getSummary(Long sellerId);

    java.util.List<SellerAnalyticsDtos.SalesTrend> getSalesTrend(Long sellerId);

    java.util.List<SellerAnalyticsDtos.SalesTrend> getSalesTrend(Long sellerId, String period);

    java.util.List<SellerAnalyticsDtos.TopProduct> getTopProducts(Long sellerId);

    java.util.List<SellerAnalyticsDtos.LowStockProduct> getLowStockProducts(Long sellerId);

    java.util.List<SellerAnalyticsDtos.RecentSale> getRecentSales(Long sellerId);

    SellerAnalyticsDtos.Dashboard getDashboard(Long sellerId);
}