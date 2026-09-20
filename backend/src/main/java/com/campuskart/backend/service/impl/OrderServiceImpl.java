package com.campuskart.backend.service.impl;

import com.campuskart.backend.entity.Order;
import com.campuskart.backend.entity.Product;
import com.campuskart.backend.dto.ApplyCouponRequest;
import com.campuskart.backend.dto.CartItemRequest;
import com.campuskart.backend.repository.OrderRepository;
import com.campuskart.backend.repository.ProductRepository;
import com.campuskart.backend.service.CouponService;
import com.campuskart.backend.service.OrderService;
import com.campuskart.backend.service.NotificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger logger = LoggerFactory.getLogger(OrderServiceImpl.class);

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired(required = false)
    private CouponService couponService;


    // =========================
    // CREATE ORDER
    // =========================

    @Override
    @Transactional
    public Order saveOrder(Order order) {

        validateDeliveryAddress(order);

        Product product = order.getProductId() == null
                ? null
                : productRepository.findById(order.getProductId())
                        .orElse(null);

        if (product == null) {
            throw new RuntimeException("Product not found");
        }

        if (order.getQuantity() == null
                || order.getQuantity() <= 0) {
            throw new RuntimeException(
                    "Order quantity must be greater than zero");
        }

        if (product.getQuantity() == null
                || order.getQuantity() > product.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        double itemTotal = product.getPrice() * order.getQuantity();
        order.setCouponDiscount(0.0);

        if (order.getCouponCode() != null && !order.getCouponCode().isBlank()) {
            if (couponService == null || order.getCheckoutItems() == null || order.getCheckoutItems().isEmpty()) {
                throw new IllegalArgumentException("Complete cart details are required for coupon checkout");
            }
            ApplyCouponRequest couponRequest = new ApplyCouponRequest();
            couponRequest.setCode(order.getCouponCode());
            couponRequest.setItems(order.getCheckoutItems());
            CouponService.CouponCalculation calculation = couponService.calculate(order.getCouponCode(), couponRequest);
            CartItemRequest currentLine = order.getCheckoutItems().stream()
                    .filter(line -> line.getProductId().equals(order.getProductId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Order item is missing from checkout cart"));
            if (!currentLine.getQuantity().equals(order.getQuantity())) {
                throw new IllegalArgumentException("Order quantity does not match checkout cart");
            }
            double lineShare = itemTotal / calculation.originalSubtotal();
            double allocatedDiscount = Math.min(itemTotal, calculation.discountAmount() * lineShare);
            order.setCouponDiscount(roundMoney(allocatedDiscount));
            order.setTotalPrice(roundMoney(itemTotal - allocatedDiscount));
            if (Boolean.TRUE.equals(order.getCouponUsageClaim())) {
                couponService.claimUsage(order.getCouponCode());
            }
        } else {
            order.setCouponCode(null);
            order.setTotalPrice(itemTotal);
        }

        if (order.getStatus() == null
                || order.getStatus().isBlank()) {
            order.setStatus("PENDING");
        }

        product.setQuantity(
                product.getQuantity() - order.getQuantity()
        );

        productRepository.save(product);
        return orderRepository.save(order);
    }


    // =========================
    // GET ALL ORDERS
    // =========================

    @Override
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }


    // =========================
    // GET ORDER BY ID
    // =========================

    @Override
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }


    // =========================
    // GET ORDERS BY USER
    // CUSTOMER ORDERS
    // =========================

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }


    // =========================
    // GET ORDERS BY PRODUCT
    // =========================

    @Override
    public List<Order> getOrdersByProductId(Long productId) {
        return orderRepository.findByProductId(productId);
    }


    // =========================
    // GET ORDERS BY STATUS
    // =========================

    @Override
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }


    // =========================
    // GET ORDERS BY SELLER
    // SELLER DASHBOARD
    // =========================

    @Override
    public List<Order> getOrdersBySellerId(Long sellerId) {

        List<Product> sellerProducts =
                productRepository.findBySellerId(sellerId);

        if (sellerProducts == null || sellerProducts.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> productIds = new ArrayList<>();
        for (Product product : sellerProducts) {
            productIds.add(product.getId());
        }

        return orderRepository.findByProductIdIn(productIds);
    }


    // =========================
    // UPDATE ORDER
    // =========================

    @Override
    public Order updateOrder(Long id, Order order) {

        Optional<Order> existingOrder =
                orderRepository.findById(id);

        if (existingOrder.isPresent()) {

            Order currentOrder =
                    existingOrder.get();
            String previousStatus = currentOrder.getStatus();

            currentOrder.setUserId(
                    order.getUserId()
            );

            currentOrder.setProductId(
                    order.getProductId()
            );

            currentOrder.setQuantity(
                    order.getQuantity()
            );

            currentOrder.setTotalPrice(
                    order.getTotalPrice()
            );

            currentOrder.setStatus(
                    order.getStatus()
            );

                if (!isBlank(order.getDeliveryAddress())) {
                    currentOrder.setDeliveryAddress(order.getDeliveryAddress());
                }
                if (!isBlank(order.getDeliveryCity())) {
                    currentOrder.setDeliveryCity(order.getDeliveryCity());
                }
                if (!isBlank(order.getDeliveryState())) {
                    currentOrder.setDeliveryState(order.getDeliveryState());
                }
                if (!isBlank(order.getDeliveryPincode())) {
                    currentOrder.setDeliveryPincode(order.getDeliveryPincode());
                }
                if (order.getDeliveryLatitude() != null) {
                    currentOrder.setDeliveryLatitude(order.getDeliveryLatitude());
                }
                if (order.getDeliveryLongitude() != null) {
                    currentOrder.setDeliveryLongitude(order.getDeliveryLongitude());
                }

            Order savedOrder = orderRepository.save(currentOrder);
            notifyStatusChange(savedOrder, previousStatus, savedOrder.getStatus());
            return savedOrder;
        }

        throw new RuntimeException(
                "Order not found with ID: " + id
        );
    }

    // =========================
// UPDATE ORDER STATUS
// =========================

@Override
public Order updateOrderStatus(Long id, String status) {

    Order order = orderRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Order not found with ID: " + id
                    )
            );

    String previousStatus = order.getStatus();
    order.setStatus(status);

    Order savedOrder = orderRepository.save(order);
    notifyStatusChange(savedOrder, previousStatus, savedOrder.getStatus());
    return savedOrder;
}


    // =========================
    // DELETE ORDER
    // =========================

    @Override
    public void deleteOrder(Long id) {

        if (!orderRepository.existsById(id)) {

            throw new RuntimeException(
                    "Order not found with ID: " + id
            );
        }

        orderRepository.deleteById(id);
    }

    private void validateDeliveryAddress(Order order) {
        if (order == null
                || isBlank(order.getDeliveryAddress())
                || isBlank(order.getDeliveryCity())
                || isBlank(order.getDeliveryState())
                || isBlank(order.getDeliveryPincode())) {
            throw new IllegalArgumentException(
                    "Delivery address, city, state, and pincode are required"
            );
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private double roundMoney(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private void notifyStatusChange(Order order, String previousStatus, String currentStatus) {
        if (notificationService == null
                || order == null
                || order.getUserId() == null
                || isBlank(currentStatus)
                || currentStatus.equalsIgnoreCase(previousStatus)) {
            return;
        }

        try {
            notificationService.createForOrderStatus(
                    order.getId(), order.getUserId(), currentStatus);
        } catch (RuntimeException ex) {
            logger.warn("Unable to create notification for order {} status {}",
                    order.getId(), currentStatus, ex);
        }
    }
}