package com.campuskart.backend;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.dto.CartItemRequest;
import com.campuskart.backend.service.CouponService;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.impl.OrderServiceImpl;
import com.campuskart.backend.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private CouponService couponService;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void statusChangeCreatesNotificationForSupportedStatuses() {
        Order order = new Order(42L, 7L, 13L, 1, 1200.0, "PENDING");
        when(orderRepository.findById(42L)).thenReturn(java.util.Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        for (String status : List.of("ACCEPTED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED")) {
            order.setStatus("PENDING");
            orderService.updateOrderStatus(42L, status);
        }

        verify(notificationService).createForOrderStatus(42L, 7L, "ACCEPTED");
        verify(notificationService).createForOrderStatus(42L, 7L, "PROCESSING");
        verify(notificationService).createForOrderStatus(42L, 7L, "SHIPPED");
        verify(notificationService).createForOrderStatus(42L, 7L, "DELIVERED");
        verify(notificationService).createForOrderStatus(42L, 7L, "CANCELLED");
    }

    @Test
    void unchangedStatusDoesNotCreateNotification() {
        Order order = new Order(42L, 7L, 13L, 1, 1200.0, "PROCESSING");
        when(orderRepository.findById(42L)).thenReturn(java.util.Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        orderService.updateOrderStatus(42L, "PROCESSING");

        verify(notificationService, never()).createForOrderStatus(any(), any(), any());
    }

    @Test
    void saveOrderShouldRejectIncompleteDeliveryAddress() {
        Order order = new Order();
        order.setProductId(13L);
        order.setQuantity(1);
        order.setDeliveryAddress("Campus hostel");
        order.setDeliveryCity("Pune");
        order.setDeliveryState("Maharashtra");

        assertThrows(IllegalArgumentException.class, () -> orderService.saveOrder(order));
    }

    @Test
    void saveOrderShouldPersistDeliveryAddressAndCoordinates() {
        User seller = new User();
        seller.setId(2L);
        Product product = new Product();
        product.setId(13L);
        product.setPrice(1200.0);
        product.setQuantity(5);
        product.setSeller(seller);

        Order order = new Order();
        order.setUserId(9L);
        order.setProductId(13L);
        order.setQuantity(1);
        order.setDeliveryAddress("12 Main Road");
        order.setDeliveryCity("Pune");
        order.setDeliveryState("Maharashtra");
        order.setDeliveryPincode("411001");
        order.setDeliveryLatitude(18.5204);
        order.setDeliveryLongitude(73.8567);

        when(productRepository.findById(13L)).thenReturn(java.util.Optional.of(product));
        when(orderRepository.save(order)).thenReturn(order);

        Order saved = orderService.saveOrder(order);

        assertEquals("12 Main Road", saved.getDeliveryAddress());
        assertEquals("411001", saved.getDeliveryPincode());
        assertEquals(18.5204, saved.getDeliveryLatitude());
        assertEquals(73.8567, saved.getDeliveryLongitude());
    }

    @Test
    void saveOrderRecalculatesDiscountInsteadOfTrustingClientTotal() {
        Product product = new Product();
        product.setId(13L);
        product.setPrice(1000.0);
        product.setQuantity(5);
        Order order = new Order();
        order.setUserId(9L);
        order.setProductId(13L);
        order.setQuantity(1);
        order.setTotalPrice(0.01);
        order.setCouponCode("SAVE20");
        order.setCouponUsageClaim(false);
        CartItemRequest item = new CartItemRequest();
        item.setProductId(13L);
        item.setQuantity(1);
        order.setCheckoutItems(List.of(item));
        order.setDeliveryAddress("12 Main Road");
        order.setDeliveryCity("Pune");
        order.setDeliveryState("Maharashtra");
        order.setDeliveryPincode("411001");

        when(productRepository.findById(13L)).thenReturn(java.util.Optional.of(product));
        when(couponService.calculate(any(), any())).thenReturn(
                new CouponService.CouponCalculation(null, 1000.0, 200.0, 800.0));
        when(orderRepository.save(order)).thenReturn(order);

        Order saved = orderService.saveOrder(order);

        assertEquals(800.0, saved.getTotalPrice());
        assertEquals(200.0, saved.getCouponDiscount());
    }

    @Test
    void getOrdersBySellerIdShouldReturnOrdersForSellerProductsOnly() {
        User seller = new User();
        seller.setId(2L);

        Product productA = new Product();
        productA.setId(13L);
        productA.setSeller(seller);

        Product productB = new Product();
        productB.setId(15L);
        productB.setSeller(seller);

        Order sellerOrder1 = new Order(15L, 9L, 13L, 1, 1200.0, "DELIVERED");
        Order sellerOrder2 = new Order(17L, 9L, 15L, 1, 899.0, "DELIVERED");
        Order unrelatedOrder = new Order(99L, 9L, 40L, 1, 750.0, "DELIVERED");

        when(productRepository.findBySellerId(2L)).thenReturn(List.of(productA, productB));
        when(orderRepository.findByProductIdIn(List.of(13L, 15L))).thenReturn(List.of(sellerOrder1, sellerOrder2));

        List<Order> result = orderService.getOrdersBySellerId(2L);

        assertEquals(2, result.size());
        assertEquals(List.of(15L, 17L), result.stream().map(Order::getId).toList());
    }
}
