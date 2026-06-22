import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getNotifications,
  type TicketNotification,
} from '../api/notifications';

type NotificationsPanelProps = {
  token: string;
};

const MAX_VISIBLE_NOTIFICATIONS = 5;

function NotificationsPanel({ token }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<TicketNotification[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const visibleNotifications = notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS);
  const hiddenNotificationCount = Math.max(
    notifications.length - MAX_VISIBLE_NOTIFICATIONS,
    0,
  );

  useEffect(() => {
    async function loadNotifications() {
      setIsLoading(true);
      setError('');

      try {
        const items = await getNotifications(token);
        setNotifications(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load notifications.');
      } finally {
        setIsLoading(false);
      }
    }

    loadNotifications();
  }, [token]);

  return (
    <section className="notifications-panel">
      <div className="section-heading">
        <div>
          <p className="card-label">Notifications</p>
          <h3>Recent activity</h3>
          <p className="muted-text">
            Showing the latest {Math.min(notifications.length, MAX_VISIBLE_NOTIFICATIONS)} updates.
          </p>
        </div>
      </div>

      {isLoading && <p>Loading notifications...</p>}

      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && notifications.length === 0 && (
        <p className="muted-text">No notifications yet.</p>
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <>
          <div className="notifications-list">
            {visibleNotifications.map((notification) => (
              <article className="notification-card" key={notification.id}>
                <div>
                  <p className="notification-message">{notification.message}</p>
                  <p className="muted-text">
                    {notification.ticket.public_id} · {notification.ticket.title}
                  </p>
                </div>

                <Link
                  className="secondary-button compact-button"
                  to={`/tickets/${notification.ticket.id}`}
                >
                  Open
                </Link>
              </article>
            ))}
          </div>

          {hiddenNotificationCount > 0 && (
            <p className="muted-text notifications-summary">
              +{hiddenNotificationCount} more recent notifications not shown here.
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default NotificationsPanel;