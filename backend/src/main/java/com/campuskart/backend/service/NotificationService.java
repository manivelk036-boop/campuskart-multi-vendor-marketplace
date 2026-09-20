package com.campuskart.backend.service;

import com.campuskart.backend.dto.NotificationResponse;
import com.campuskart.backend.entity.User;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getNotifications(User customer);

    long getUnreadCount(User customer);

    void markAsRead(Long notificationId, User customer);

    void markAllAsRead(User customer);

    void createForOrderStatus(Long orderId, Long userId, String status);
}
