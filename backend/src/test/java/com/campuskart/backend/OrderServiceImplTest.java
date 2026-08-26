package com.campuskart.backend;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

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
