import { useEffect, useState } from 'react';

import './App.css';
import { login, type AuthUser } from './api/auth';
import { getTickets, type Ticket } from './api/tickets';

const TOKEN_STORAGE_KEY = 'supporthub_token';
const USER_STORAGE_KEY = 'supporthub_user';

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const [email, setEmail] = useState('agent@supporthub.test');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

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

  useEffect(() => {
    async function loadTickets() {
      if (!token || !user) {
        setTickets([]);
        return;
      }

      setTicketsLoading(true);
      setTicketsError(null);

      try {
        const loadedTickets = await getTickets(token);
        setTickets(loadedTickets);
      } catch (caughtError) {
        setTicketsError(
          caughtError instanceof Error ? caughtError.message : 'Could not load tickets.',
        );
      } finally {
        setTicketsLoading(false);
      }
    }

    loadTickets();
  }, [token, user]);

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

      setToken(response.token);
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

    setToken(null);
    setUser(null);
    setTickets([]);
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
              The frontend is now using your saved token to load tickets from the
              backend API.
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

      {user ? (
        <section className="tickets-section">
          <div className="section-heading">
            <p className="eyebrow">Ticket dashboard</p>
            <h2>Tickets from the Laravel API.</h2>
            <p>
              This list is loaded from <code>GET /api/tickets</code> using the token
              saved after login.
            </p>
          </div>

          {ticketsLoading ? <p className="muted-message">Loading tickets...</p> : null}

          {ticketsError ? <p className="error-message">{ticketsError}</p> : null}

          {!ticketsLoading && !ticketsError && tickets.length === 0 ? (
            <p className="muted-message">No tickets found for this account.</p>
          ) : null}

          <div className="ticket-grid">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="ticket-card">
                <div className="ticket-card-header">
                  <span>{ticket.public_id}</span>
                  <span className={`ticket-status status-${ticket.status}`}>
                    {ticket.status.replaceAll('_', ' ')}
                  </span>
                </div>

                <h3>{ticket.title}</h3>

                <p>{ticket.description}</p>

               <div className="ticket-meta">
  <span>Priority: {ticket.priority}</span>
  <span>Customer: {ticket.customer?.name ?? 'Unknown customer'}</span>
  <span>
    Agent: {ticket.assigned_agent?.name ?? 'Unassigned'}
  </span>
  <span>Replies: {ticket.replies?.length ?? 0}</span>
</div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

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