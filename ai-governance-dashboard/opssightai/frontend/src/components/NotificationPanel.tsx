import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../services/api';
import './NotificationPanel.css';

interface Notification {
  id: string;
  userId: string;
  assetId?: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  timestamp: string;
  readAt?: string;
  channels: string[];
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

function NotificationPanel({ isOpen, onClose, userId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getAll({
        userId,
        unreadOnly: filter === 'unread',
        limit: 50
      });
      setNotifications(response.data.notifications || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId, userId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead(userId);
      setNotifications(prev =>
        prev.map(n => ({ ...n, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return 'ℹ️';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      risk_change: 'Risk Change',
      critical_anomaly: 'Critical Anomaly',
      high_risk_forecast: 'High Risk Forecast',
      asset_offline: 'Asset Offline',
      maintenance_due: 'Maintenance Due',
      system_alert: 'System Alert'
    };
    return labels[type] || type;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;

  if (!isOpen) return null;

  return (
    <>
      <div className="notification-overlay" onClick={onClose} />
      <div className="notification-panel">
        <div className="panel-header">
          <h2>Notifications</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="panel-controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-read" onClick={handleMarkAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="notifications-list">
          {loading ? (
            <div className="loading-state">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🔔</span>
              <p>No notifications</p>
              <p className="empty-hint">
                {filter === 'unread' ? 'All caught up!' : 'You have no notifications yet'}
              </p>
            </div>
          ) : (
            notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.readAt ? 'unread' : ''}`}
                onClick={() => !notification.readAt && handleMarkAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getSeverityIcon(notification.severity)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <span className="notification-type">
                      {getTypeLabel(notification.type)}
                    </span>
                    <span className="notification-time">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <h4 className="notification-title">{notification.title}</h4>
                  <p className="notification-message">{notification.message}</p>
                  {notification.assetId && (
                    <Link
                      to={`/assets/${notification.assetId}`}
                      className="notification-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Asset Details →
                    </Link>
                  )}
                </div>
                {!notification.readAt && <div className="unread-indicator" />}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
