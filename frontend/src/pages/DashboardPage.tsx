import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { AuthUser } from '../api/auth';
import { getDashboardStats, type DashboardStats } from '../api/dashboard';
import AppLayout from '../components/AppLayout';

type DashboardPageProps = {
  token: string;
  user: AuthUser;
  onLogout: () => void;
};

function DashboardPage({ token, user, onLogout }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      setError('');

      try {
        const dashboardStats = await getDashboardStats(token);
        setStats(dashboardStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard stats.');
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, [token]);

  return (
    <AppLayout user={user} token={token} onLogout={onLogout}>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="card-label">Dashboard</p>
            <h2>Support overview</h2>
            <p>Track the current health of your support queue.</p>
          </div>

          <Link className="secondary-button" to="/tickets">
            View tickets
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}

        {isLoading && <p>Loading dashboard...</p>}

        {stats && (
          <div className="stats-grid">
            <article className="stat-card">
              <p className="card-label">Open</p>
              <strong>{stats.open_tickets}</strong>
              <span>Tickets waiting for action</span>
            </article>

            <article className="stat-card">
              <p className="card-label">Closed</p>
              <strong>{stats.closed_tickets}</strong>
              <span>Completed support requests</span>
            </article>

            <article className="stat-card">
              <p className="card-label">High priority</p>
              <strong>{stats.high_priority_tickets}</strong>
              <span>High or critical tickets</span>
            </article>

            <article className="stat-card">
              <p className="card-label">Assigned</p>
              <strong>{stats.assigned_tickets}</strong>
              <span>Tickets owned by support</span>
            </article>
          </div>
        )}
      </section>
    </AppLayout>
  );
}

export default DashboardPage;