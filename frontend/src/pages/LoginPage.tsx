import { Link } from 'react-router-dom';

import type { AuthUser } from '../api/auth';

type LoginPageProps = {
  user: AuthUser | null;
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onLogin: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onLogout: () => void;
};

function LoginPage({
  user,
  email,
  password,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onLogout,
}: LoginPageProps) {
  const demoAccounts = [
    {
      role: 'Admin',
      email: 'admin@supporthub.test',
      description: 'Manages the support workspace.',
    },
    {
      role: 'Agent',
      email: 'agent@supporthub.test',
      description: 'Responds to tickets and updates statuses.',
    },
    {
      role: 'Customer',
      email: 'customer@supporthub.test',
      description: 'Creates tickets and replies to support staff.',
    },
  ];

  const backendFeatures = [
    'Token authentication',
    'Role-based authorization',
    'Dashboard metrics',
    'Ticket workflow',
    'Replies and status history',
    'Simulated notifications',
    'File attachments',
    'Server-side ticket filtering',
    'Server-side ticket sorting',
    'Paginated ticket API',
    'Dynamic agent assignment',
    'Automated tests',
    'GitHub Actions CI',
  ];

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">SupportHub MVP</p>

          <h1>Customer support ticketing, built like a real product.</h1>

          <p className="hero-copy">
            SupportHub is a portfolio SaaS project with a Laravel API, role-based
            workflows, dashboard metrics, notifications, file attachments, automated
            tests, CI, and a React frontend.
          </p>

          <div className="hero-actions">
            <a href="#login" className="primary-button">
              Login to demo
            </a>

            <a href="#backend-status" className="secondary-button">
              Backend status
            </a>
          </div>
        </div>

        <div className="hero-card">
          <p className="card-label">Backend health</p>
          <h2>API foundation ready</h2>
          <p>
            The Laravel backend supports authentication, tickets, replies, assignment,
            dashboard stats, notifications, file attachments, policies, server-side
            filters, sorting, pagination, dynamic agents, tests, and CI.
          </p>

          <div className="status-pill">39 tests passing</div>
        </div>
      </section>

      <section id="login" className="login-section">
        <div className="section-heading">
          <p className="eyebrow">API login</p>
          <h2>Connect React to Laravel Sanctum.</h2>
          <p>
            Use one of the seeded demo users. The frontend calls the real Laravel{' '}
            <code>/api/login</code> endpoint and stores the returned token.
          </p>
        </div>

        {user ? (
          <div className="dashboard-preview">
            <p className="card-label">Signed in</p>
            <h3>Welcome, {user.name}</h3>
            <p>
              You are logged in as <strong>{user.role}</strong> using{' '}
              <strong>{user.email}</strong>.
            </p>
            <p>
              Continue to the support workspace to view dashboard metrics, create,
              filter, sort, assign, and manage support tickets.
            </p>

            <div className="hero-actions">
              <Link className="primary-button" to="/dashboard">
                Open dashboard
              </Link>

              <Link className="secondary-button" to="/tickets">
                Open tickets
              </Link>

              <button className="secondary-button button-reset" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <form className="login-card" onSubmit={onLogin}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                required
              />
            </label>

            {error ? <p className="error-message">{error}</p> : null}

            <button className="primary-button button-reset" type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}
      </section>

      <section id="backend-status" className="section-grid">
        <div className="section-heading">
          <p className="eyebrow">Backend status</p>
          <h2>Strong foundation before UI polish.</h2>
          <p>
            The frontend is built on a tested Laravel API with authentication,
            authorization, ticket workflows, dashboard metrics, notifications, and
            attachment uploads.
          </p>
        </div>

        <div className="feature-grid">
          {backendFeatures.map((feature) => (
            <div key={feature} className="feature-card">
              <span className="check-icon">✓</span>
              <p>{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo-accounts" className="demo-section">
        <div className="section-heading">
          <p className="eyebrow">Demo users</p>
          <h2>Seeded backend accounts.</h2>
          <p>
            These accounts are created by the Laravel seeder and can be used to test
            role-based workflows.
          </p>
        </div>

        <div className="account-grid">
          {demoAccounts.map((account) => (
            <article key={account.email} className="account-card">
              <h3>{account.role}</h3>
              <p className="account-email">{account.email}</p>
              <p>{account.description}</p>
              <span>Password: password</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LoginPage;