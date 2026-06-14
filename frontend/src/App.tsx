import { useState } from 'react';

import './App.css';
import { login, type AuthUser } from './api/auth';

const TOKEN_STORAGE_KEY = 'supporthub_token';
const USER_STORAGE_KEY = 'supporthub_user';

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  });

  const [email, setEmail] = useState('agent@supporthub.test');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    'Ticket workflow',
    'Replies and status history',
    'Automated tests',
    'GitHub Actions CI',
  ];

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setIsLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));

      setUser(response.user);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    setUser(null);
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">SupportHub MVP</p>

          <h1>Customer support ticketing, built like a real product.</h1>

          <p className="hero-copy">
            SupportHub is a portfolio SaaS project with a Laravel API, role-based
            workflows, automated tests, CI, and a React frontend.
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
            The Laravel backend already supports authentication, tickets, replies,
            assignment, policies, tests, and CI.
          </p>

          <div className="status-pill">17 tests passing</div>
        </div>
      </section>

      <section id="login" className="login-section">
        <div className="section-heading">
          <p className="eyebrow">API login</p>
          <h2>Connect React to Laravel Sanctum.</h2>
          <p>
            Use one of the seeded demo users. The frontend will call the real
            Laravel <code>/api/login</code> endpoint and store the returned token.
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
              Next we will use this token to load tickets from the backend API.
            </p>

            <button className="secondary-button button-reset" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <form className="login-card" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
            The frontend is starting from a stable backend instead of guessing what
            the API will do later.
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

export default App;