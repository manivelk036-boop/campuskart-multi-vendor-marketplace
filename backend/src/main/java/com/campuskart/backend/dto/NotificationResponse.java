package com.campuskart.backend.dto;

import com.campuskart.backend.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        Long relatedOrderId,
        boolean read,
        LocalDateTime createdAt) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getRelatedOrderId(),
                notification.isRead(),
                notification.getCreatedAt());
    }
}
