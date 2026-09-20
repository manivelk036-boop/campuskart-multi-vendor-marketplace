package com.campuskart.backend;

import com.campuskart.backend.entity.Notification;
import com.campuskart.backend.entity.User;
import com.campuskart.backend.repository.NotificationRepository;
import com.campuskart.backend.repository.UserRepository;
import com.campuskart.backend.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User customer;

    @BeforeEach
    void setUp() {
        customer = new User();
        customer.setId(7L);
        customer.setRole("CUSTOMER");
    }

    @Test
    void createsNotificationsForEachSupportedOrderStatus() {
        when(notificationRepository.existsByUserIdAndRelatedOrderIdAndOrderStatus(7L, 42L, "ACCEPTED")).thenReturn(false);
        when(notificationRepository.existsByUserIdAndRelatedOrderIdAndOrderStatus(7L, 42L, "PROCESSING")).thenReturn(false);
        when(notificationRepository.existsByUserIdAndRelatedOrderIdAndOrderStatus(7L, 42L, "SHIPPED")).thenReturn(false);
        when(notificationRepository.existsByUserIdAndRelatedOrderIdAndOrderStatus(7L, 42L, "DELIVERED")).thenReturn(false);
        when(notificationRepository.existsByUserIdAndRelatedOrderIdAndOrderStatus(7L, 42L, "CANCELLED")).thenReturn(false);
        when(userRepository.findById(7L)).thenReturn(Optional.of(customer));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.createForOrderStatus(42L, 7L, "ACCEPTED");
        notificationService.createForOrderStatus(42L, 7L, "PROCESSING");
        notificationService.createForOrderStatus(42L, 7L, "SHIPPED");
        notificationService.createForOrderStatus(42L, 7L, "DELIVERED");
        notificationService.createForOrderStatus(42L, 7L, "CANCELLED");

        verify(notificationRepository, org.mockito.Mockito.times(5)).save(any(Notification.class));
    }

    @Test
    void rejectedOrderCreatesCancelledNotification() {
        when(notificationRepository.existsByUserIdAndRelatedOrderIdAndOrderStatus(7L, 42L, "CANCELLED")).thenReturn(false);
        when(userRepository.findById(7L)).thenReturn(Optional.of(customer));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        notificationService.createForOrderStatus(42L, 7L, "REJECTED");

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void duplicateStatusNotificationIsSkipped() {
        when(notificationRepository.existsByUserIdAndRelatedOrderIdAndOrderStatus(7L, 42L, "SHIPPED")).thenReturn(true);

        notificationService.createForOrderStatus(42L, 7L, "SHIPPED");

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void customerCanRetrieveOnlyOwnNotifications() {
        Notification notification = notification(1L, customer, false);
        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(7L)).thenReturn(List.of(notification));

        assertEquals(1, notificationService.getNotifications(customer).size());
        verify(notificationRepository).findByUserIdOrderByCreatedAtDesc(7L);
    }

    @Test
    void unreadCountIsReturnedForCurrentCustomer() {
        when(notificationRepository.countByUserIdAndReadFalse(7L)).thenReturn(3L);

        assertEquals(3L, notificationService.getUnreadCount(customer));
    }

    @Test
    void customerCanMarkOwnNotificationRead() {
        Notification notification = notification(1L, customer, false);
        when(notificationRepository.findByIdAndUserId(1L, 7L)).thenReturn(Optional.of(notification));

        notificationService.markAsRead(1L, customer);

        assertEquals(true, notification.isRead());
        verify(notificationRepository).save(notification);
    }

    @Test
    void customerCannotModifyAnotherUsersNotification() {
        when(notificationRepository.findByIdAndUserId(1L, 7L)).thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class,
                () -> notificationService.markAsRead(1L, customer));
        verify(notificationRepository, never()).save(any());
    }

    private Notification notification(Long id, User user, boolean read) {
        Notification notification = new Notification();
        notification.setId(id);
        notification.setUser(user);
        notification.setTitle("Order update");
        notification.setMessage("Order updated");
        notification.setRelatedOrderId(42L);
        notification.setOrderStatus("SHIPPED");
        notification.setRead(read);
        return notification;
    }
}
