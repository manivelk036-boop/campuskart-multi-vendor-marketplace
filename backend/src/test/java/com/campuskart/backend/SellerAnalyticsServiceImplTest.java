package com.campuskart.backend;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.repository.SellerAnalyticsRepository;
import com.campuskart.backend.service.impl.SellerAnalyticsServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class SellerAnalyticsServiceImplTest {

    @Mock
    private SellerAnalyticsRepository repository;

    private SellerAnalyticsServiceImpl service;
    private Product mouse;
    private Product notebook;

    @BeforeEach
    void setUp() {
        service = new SellerAnalyticsServiceImpl(repository);
        mouse = product(10L, "Wireless Mouse", 3, 2.0);
        notebook = product(11L, "Notebook", 12, 1.0);
        lenient().when(repository.findProductsBySellerId(1L)).thenReturn(List.of(mouse, notebook));
        lenient().when(repository.findOrdersByProductIds(List.of(10L, 11L))).thenReturn(List.of(
                order(100L, 10L, 3, 600.0, "DELIVERED", LocalDateTime.of(2026, 9, 18, 10, 0)),
                order(101L, 10L, 2, 400.0, "CANCELLED", LocalDateTime.of(2026, 9, 18, 11, 0)),
                order(102L, 11L, 4, 800.0, "COMPLETED", LocalDateTime.of(2026, 9, 19, 11, 0))));
            lenient().when(repository.findOrdersByProductIds(List.of())).thenReturn(List.of());
    }

    @Test
    void summaryCalculatesSellerMetricsAndExcludesCancelledRevenue() {
        var summary = service.getSummary(1L);

        assertEquals(1400.0, summary.totalRevenue());
        assertEquals(3, summary.totalOrders());
        assertEquals(7, summary.productsSold());
    }

    @Test
    void sellerDataIsScopedToRequestedSeller() {
        when(repository.findProductsBySellerId(2L)).thenReturn(List.of());

        var summary = service.getSummary(2L);

        assertEquals(0.0, summary.totalRevenue());
        assertEquals(0, summary.totalOrders());
        assertEquals(0, summary.productsSold());
    }

    @Test
    void salesTrendGroupsRevenueOrdersByDate() {
        var trend = service.getSalesTrend(1L);

        assertEquals(2, trend.size());
        assertEquals(600.0, trend.get(0).revenue());
        assertEquals(1, trend.get(0).orders());
        assertEquals(800.0, trend.get(1).revenue());
    }

    @Test
    void topProductsAreSortedByQuantitySold() {
        var topProducts = service.getTopProducts(1L);

        assertEquals("Notebook", topProducts.get(0).productName());
        assertEquals(4, topProducts.get(0).quantitySold());
        assertEquals(800.0, topProducts.get(0).revenue());
    }

    @Test
    void lowStockIncludesZeroThroughThreshold() {
        var lowStock = service.getLowStockProducts(1L);

        assertEquals(1, lowStock.size());
        assertEquals("Wireless Mouse", lowStock.get(0).productName());
        assertEquals(3, lowStock.get(0).stockQuantity());
    }

    @Test
    void emptyAnalyticsDatasetReturnsEmptyValues() {
        when(repository.findProductsBySellerId(3L)).thenReturn(List.of());

        var dashboard = service.getDashboard(3L);

        assertEquals(0.0, dashboard.summary().totalRevenue());
        assertEquals(0, dashboard.summary().totalOrders());
        assertEquals(0, dashboard.salesTrend().size());
        assertEquals(0, dashboard.topProducts().size());
        assertEquals(0, dashboard.lowStockProducts().size());
        assertEquals(0, dashboard.recentSales().size());
    }

    private Product product(Long id, String name, int stock, double price) {
        Product product = new Product();
        product.setId(id);
        product.setProductName(name);
        product.setQuantity(stock);
        product.setPrice(price);
        return product;
    }

    private Order order(Long id, Long productId, int quantity, double total,
                        String status, LocalDateTime createdAt) {
        Order order = new Order(id, 20L, productId, quantity, total, status);
        order.setCreatedAt(createdAt);
        return order;
    }
}
