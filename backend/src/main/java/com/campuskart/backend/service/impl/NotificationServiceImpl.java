package com.campuskart.backend.service.impl;

import com.campuskart.backend.dto.NotificationResponse;
import com.campuskart.backend.entity.Notification;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.NotificationRepository;
import com.campuskart.backend.repository.UserRepository;
import com.campuskart.backend.service.NotificationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(User customer) {
        requireCustomer(customer);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(customer.getId())
                .stream().map(NotificationResponse::from).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(User customer) {
        requireCustomer(customer);
        return notificationRepository.countByUserIdAndReadFalse(customer.getId());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, User customer) {
        requireCustomer(customer);
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, customer.getId())
                .orElseThrow(() -> new AccessDeniedException("You can only modify your own notifications"));
        notification.setRead(true);
        try {
            notificationRepository.save(notification);
        } catch (DataIntegrityViolationException ex) {
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(User customer) {
        requireCustomer(customer);
        notificationRepository.findByUserIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .filter(notification -> !notification.isRead())
                .forEach(notification -> notification.setRead(true));
    }

    @Override
    @Transactional
    public void createForOrderStatus(Long orderId, Long userId, String status) {
        if (orderId == null || userId == null || status == null) return;
        String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
        String notificationStatus = "REJECTED".equals(normalizedStatus) ? "CANCELLED" : normalizedStatus;
        if (!List.of("ACCEPTED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED").contains(notificationStatus)) return;
        if (notificationRepository.existsByUserIdAndRelatedOrderIdAndOrderStatus(userId, orderId, notificationStatus)) return;

        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Notification customer not found"));
        Notification notification = new Notification();
        notification.setUser(customer);
        notification.setRelatedOrderId(orderId);
        notification.setOrderStatus(notificationStatus);
        notification.setRead(false);
        notification.setTitle(titleFor(notificationStatus));
        notification.setMessage(messageFor(notificationStatus, orderId));
        notificationRepository.save(notification);
    }

    private void requireCustomer(User user) {
        if (user == null || user.getId() == null || !"CUSTOMER".equalsIgnoreCase(user.getRole())) {
            throw new AccessDeniedException("Only customers can access notifications");
        }
    }

    private String titleFor(String status) {
        return switch (status) {
            case "ACCEPTED" -> "Order accepted";
            case "PROCESSING" -> "Order being prepared";
            case "SHIPPED" -> "Order shipped";
            case "DELIVERED" -> "Order delivered";
            case "CANCELLED" -> "Order cancelled";
            default -> "Order update";
        };
    }

    private String messageFor(String status, Long orderId) {
        return switch (status) {
            case "ACCEPTED" -> "Your order #" + orderId + " was accepted by the seller.";
            case "PROCESSING" -> "Your order #" + orderId + " is being prepared.";
            case "SHIPPED" -> "Your order #" + orderId + " is on its way.";
            case "DELIVERED" -> "Your order #" + orderId + " was delivered successfully.";
            case "CANCELLED" -> "Your order #" + orderId + " was cancelled.";
            default -> "Your order #" + orderId + " has been updated.";
        };
    }
}
