import { useCallback, useEffect, useState } from "react";
import apiClient from "../apiClient";

function Notifications({ onOpenOrders }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [notificationsResponse, countResponse] = await Promise.all([
        apiClient.get("/notifications"),
        apiClient.get("/notifications/unread-count"),
      ]);
      setNotifications(Array.isArray(notificationsResponse.data) ? notificationsResponse.data : []);
      setUnreadCount(Number(countResponse.data?.count || 0));
    } catch (requestError) {
      console.error("Unable to load notifications:", requestError);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoadId = window.setTimeout(() => void loadNotifications(), 0);
    const intervalId = window.setInterval(() => void loadNotifications(), 30000);
    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
    };
  }, [loadNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications((items) => items.map((item) => (
        item.id === notificationId ? { ...item, read: true } : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (requestError) {
      console.error("Unable to mark notification as read:", requestError);
      setError("Unable to update this notification.");
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
    onOpenOrders();
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await apiClient.patch("/notifications/read-all");
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (requestError) {
      console.error("Unable to mark all notifications as read:", requestError);
      setError("Unable to update notifications.");
    }
  };

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "Just now";
    return new Date(createdAt).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="notification-menu">
      <button
        className="notification-bell"
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
          if (!isOpen) void loadNotifications();
        }}
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 ? <b>{unreadCount > 99 ? "99+" : unreadCount}</b> : null}
      </button>

      {isOpen ? (
        <section className="notification-panel" aria-label="Notifications">
          <div className="notification-panel-header">
            <div>
              <span className="notification-eyebrow">UPDATES</span>
              <h2>Notifications</h2>
            </div>
            <button type="button" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark all as read
            </button>
          </div>

          {loading ? <p className="notification-state">Loading notifications...</p> : null}
          {error ? <p className="notification-error">{error}</p> : null}
          {!loading && !error && notifications.length === 0 ? (
            <p className="notification-state">You&apos;re all caught up.</p>
          ) : null}
          {!loading && notifications.length > 0 ? (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button
                  className={`notification-item ${notification.read ? "is-read" : "is-unread"}`}
                  key={notification.id}
                  type="button"
                  onClick={() => void handleNotificationClick(notification)}
                >
                  <span className="notification-dot" aria-hidden="true" />
                  <span className="notification-copy">
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                    <small>{formatCreatedAt(notification.createdAt)}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

export default Notifications;
