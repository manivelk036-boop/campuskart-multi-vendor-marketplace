package com.campuskart.backend.service.impl;

import com.campuskart.backend.dto.SellerAnalyticsDtos;
import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.repository.SellerAnalyticsRepository;
import com.campuskart.backend.service.SellerAnalyticsService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SellerAnalyticsServiceImpl implements SellerAnalyticsService {

    private static final Set<String> REVENUE_STATUSES = Set.of("DELIVERED", "COMPLETED");
    private static final int LOW_STOCK_THRESHOLD = 5;
    private final SellerAnalyticsRepository repository;

    public SellerAnalyticsServiceImpl(SellerAnalyticsRepository repository) {
        this.repository = repository;
    }

    @Override
    public SellerAnalyticsDtos.Summary getSummary(Long sellerId) {
        AnalyticsData data = load(sellerId);
        List<Order> revenueOrders = data.orders.stream().filter(this::isRevenueOrder).toList();
        return new SellerAnalyticsDtos.Summary(
                revenueOrders.stream().mapToDouble(order -> number(order.getTotalPrice())).sum(),
                data.orders.size(),
                revenueOrders.stream().mapToLong(order -> number(order.getQuantity())).sum());
    }

    @Override
    public List<SellerAnalyticsDtos.SalesTrend> getSalesTrend(Long sellerId) {
        return getSalesTrend(sellerId, "daily");
    }

    @Override
    public List<SellerAnalyticsDtos.SalesTrend> getSalesTrend(Long sellerId, String period) {
        AnalyticsData data = load(sellerId);
        Map<LocalDate, List<Order>> grouped = data.orders.stream()
                .filter(this::isRevenueOrder)
                .filter(order -> order.getCreatedAt() != null)
                .collect(Collectors.groupingBy(order -> trendDate(order.getCreatedAt().toLocalDate(), period), LinkedHashMap::new, Collectors.toList()));
        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new SellerAnalyticsDtos.SalesTrend(entry.getKey(),
                        entry.getValue().stream().mapToDouble(order -> number(order.getTotalPrice())).sum(),
                        entry.getValue().size()))
                .toList();
    }

    private LocalDate trendDate(LocalDate date, String period) {
        return switch (period == null ? "daily" : period.toLowerCase()) {
            case "weekly" -> date.with(DayOfWeek.MONDAY);
            case "monthly" -> date.withDayOfMonth(1);
            default -> date;
        };
    }

    @Override
    public List<SellerAnalyticsDtos.TopProduct> getTopProducts(Long sellerId) {
        AnalyticsData data = load(sellerId);
        Map<Long, List<Order>> grouped = data.orders.stream().filter(this::isRevenueOrder)
                .collect(Collectors.groupingBy(Order::getProductId));
        return grouped.entrySet().stream()
                .map(entry -> {
                    Product product = data.productById.get(entry.getKey());
                    List<Order> orders = entry.getValue();
                    return new SellerAnalyticsDtos.TopProduct(entry.getKey(),
                            product == null ? "Product #" + entry.getKey() : product.getProductName(),
                            orders.stream().mapToLong(order -> number(order.getQuantity())).sum(),
                            orders.stream().mapToDouble(order -> number(order.getTotalPrice())).sum());
                })
                .sorted(Comparator.comparingLong(SellerAnalyticsDtos.TopProduct::quantitySold).reversed()
                        .thenComparing(Comparator.comparingDouble(SellerAnalyticsDtos.TopProduct::revenue).reversed()))
                .toList();
    }

    @Override
    public List<SellerAnalyticsDtos.LowStockProduct> getLowStockProducts(Long sellerId) {
        return load(sellerId).products.stream()
                .filter(product -> number(product.getQuantity()) <= LOW_STOCK_THRESHOLD)
                .sorted(Comparator.comparingInt(product -> number(product.getQuantity())))
                .map(product -> new SellerAnalyticsDtos.LowStockProduct(product.getId(), product.getProductName(), number(product.getQuantity())))
                .toList();
    }

    @Override
    public List<SellerAnalyticsDtos.RecentSale> getRecentSales(Long sellerId) {
        AnalyticsData data = load(sellerId);
        return data.orders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .map(order -> new SellerAnalyticsDtos.RecentSale(order.getId(), order.getProductId(),
                    data.productById.get(order.getProductId()) == null
                        ? "Product #" + order.getProductId()
                        : data.productById.get(order.getProductId()).getProductName(), number(order.getQuantity()),
                        number(order.getTotalPrice()), order.getStatus(), order.getCreatedAt()))
                .toList();
    }

    @Override
    public SellerAnalyticsDtos.Dashboard getDashboard(Long sellerId) {
        return new SellerAnalyticsDtos.Dashboard(getSummary(sellerId), getSalesTrend(sellerId),
                getTopProducts(sellerId), getLowStockProducts(sellerId), getRecentSales(sellerId));
    }

    private AnalyticsData load(Long sellerId) {
        List<Product> products = repository.findProductsBySellerId(sellerId);
        Map<Long, Product> productById = products.stream().collect(Collectors.toMap(Product::getId, product -> product));
        List<Order> orders = repository.findOrdersByProductIds(products.stream().map(Product::getId).toList());
        return new AnalyticsData(products, productById, orders);
    }

    private boolean isRevenueOrder(Order order) {
        return REVENUE_STATUSES.contains(String.valueOf(order.getStatus()).toUpperCase());
    }

    private static int number(Integer value) {
        return value == null ? 0 : value;
    }

    private static double number(Double value) {
        return value == null ? 0 : value;
    }

    private record AnalyticsData(List<Product> products, Map<Long, Product> productById, List<Order> orders) {
    }
}