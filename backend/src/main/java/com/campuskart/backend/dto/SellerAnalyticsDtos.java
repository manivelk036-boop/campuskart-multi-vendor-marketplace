package com.campuskart.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class SellerAnalyticsDtos {

    private SellerAnalyticsDtos() {
    }

    public record Summary(double totalRevenue, long totalOrders, long productsSold) {
    }

    public record SalesTrend(LocalDate date, double revenue, long orders) {
    }

    public record TopProduct(Long productId, String productName, long quantitySold, double revenue) {
    }

    public record LowStockProduct(Long productId, String productName, int stockQuantity) {
    }

    public record RecentSale(Long orderId, Long productId, String productName,
                             int quantity, double totalPrice, String status,
                             LocalDateTime createdAt) {
    }

    public record Dashboard(Summary summary, List<SalesTrend> salesTrend,
                            List<TopProduct> topProducts,
                            List<LowStockProduct> lowStockProducts,
                            List<RecentSale> recentSales) {
    }
}