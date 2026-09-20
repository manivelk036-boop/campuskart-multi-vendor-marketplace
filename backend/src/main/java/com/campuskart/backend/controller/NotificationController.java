package com.campuskart.backend.controller;

import com.campuskart.backend.dto.NotificationResponse;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Customer order notification endpoints")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
})
@PreAuthorize("hasRole('CUSTOMER')")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "List the authenticated customer's notifications")
    @GetMapping
    public List<NotificationResponse> getNotifications(Authentication authentication) {
        return notificationService.getNotifications(currentCustomer(authentication));
    }

    @Operation(summary = "Get the authenticated customer's unread notification count")
    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication authentication) {
        return Map.of("count", notificationService.getUnreadCount(currentCustomer(authentication)));
    }

    @Operation(summary = "Mark one of the customer's notifications as read")
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        notificationService.markAsRead(id, currentCustomer(authentication));
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Mark all of the customer's notifications as read")
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        notificationService.markAllAsRead(currentCustomer(authentication));
        return ResponseEntity.noContent().build();
    }

    private User currentCustomer(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
