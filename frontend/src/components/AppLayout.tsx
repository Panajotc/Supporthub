import { Link } from 'react-router-dom';

import type { AuthUser } from '../api/auth';
import NotificationsPanel from './NotificationsPanel';

type AppLayoutProps = {
  user: AuthUser;
  token: string;
  onLogout: () => void;
  children: React.ReactNode;
};

function AppLayout({ user, token, onLogout, children }: AppLayoutProps) {
  return (
    <main className="app-shell">
      <header className="dashboard-preview">
        <div>
          <p className="card-label">SupportHub</p>
          <h3>Support workspace</h3>
          <p>
            Signed in as <strong>{user.role}</strong> using <strong>{user.email}</strong>.
          </p>
        </div>

        <div className="hero-actions">
          <Link className="secondary-button" to="/dashboard">
            Dashboard
          </Link>

          <Link className="secondary-button" to="/tickets">
            Tickets
          </Link>

          <Link className="secondary-button" to="/login">
            Home
          </Link>

          <button className="secondary-button button-reset" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <NotificationsPanel token={token} />

      {children}
    </main>
  );
}

export default AppLayout;