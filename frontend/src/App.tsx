import { useEffect, useState } from 'react';

import './App.css';
import { login, type AuthUser } from './api/auth';
import {
  createTicket,
  getTicket,
  getTickets,
  type Ticket,
  type TicketPriority,
} from './api/tickets';

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

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTicketLoading, setSelectedTicketLoading] = useState(false);
  const [selectedTicketError, setSelectedTicketError] = useState<string | null>(null);

  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<TicketPriority>('medium');

  const [createTicketLoading, setCreateTicketLoading] = useState(false);
  const [createTicketError, setCreateTicketError] = useState<string | null>(null);
  const [createTicketSuccess, setCreateTicketSuccess] = useState<string | null>(null);

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
    setSelectedTicket(null);
    setCreateTicketSuccess(null);
    setCreateTicketError(null);
  }

  async function handleCreateTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setCreateTicketError('You must be logged in to create a ticket.');
      return;
    }

    setCreateTicketLoading(true);
    setCreateTicketError(null);
    setCreateTicketSuccess(null);

    try {
      await createTicket(token, {
        title: newTicketTitle,
        description: newTicketDescription,
        priority: newTicketPriority,
      });

      const loadedTickets = await getTickets(token);
      setTickets(loadedTickets);

      setNewTicketTitle('');
      setNewTicketDescription('');
      setNewTicketPriority('medium');

      setCreateTicketSuccess('Ticket created successfully.');
    } catch (caughtError) {
      setCreateTicketError(
        caughtError instanceof Error ? caughtError.message : 'Could not create ticket.',
      );
    } finally {
      setCreateTicketLoading(false);
    }
  }

  async function handleSelectTicket(ticketId: number) {
    if (!token) {
      setSelectedTicketError('You must be logged in to view ticket details.');
      return;
    }

    setSelectedTicketLoading(true);
    setSelectedTicketError(null);

    try {
      const ticketDetails = await getTicket(token, ticketId);
      setSelectedTicket(ticketDetails);
    } catch (caughtError) {
      setSelectedTicketError(
        caughtError instanceof Error ? caughtError.message : 'Could not load ticket details.',
      );
    } finally {
      setSelectedTicketLoading(false);
    }
  }

  function handleBackToTickets() {
    setSelectedTicket(null);
    setSelectedTicketError(null);
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
              The frontend is using your saved token to load tickets, create new
              tickets, and view ticket details through the backend API.
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
              This list is loaded from <code>GET /api/tickets</code>. New tickets
              are created with <code>POST /api/tickets</code>. Clicking a ticket
              loads <code>GET /api/tickets/{'{id}'}</code>.
            </p>
          </div>

          {selectedTicket ? (
            <article className="ticket-detail-card">
              <button className="secondary-button button-reset" onClick={handleBackToTickets}>
                Back to tickets
              </button>

              <div className="ticket-card-header">
                <span>{selectedTicket.public_id}</span>
                <span className={`ticket-status status-${selectedTicket.status}`}>
                  {selectedTicket.status.replaceAll('_', ' ')}
                </span>
              </div>

              <h3>{selectedTicket.title}</h3>
              <p>{selectedTicket.description}</p>

              <div className="ticket-meta">
                <span>Priority: {selectedTicket.priority}</span>
                <span>Customer: {selectedTicket.customer?.name ?? 'Unknown customer'}</span>
                <span>Agent: {selectedTicket.assigned_agent?.name ?? 'Unassigned'}</span>
                <span>Created: {new Date(selectedTicket.created_at).toLocaleString()}</span>
              </div>

              <div className="reply-section">
                <h3>Replies</h3>

                {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                  <div className="reply-list">
                    {selectedTicket.replies.map((reply) => (
                      <article key={reply.id} className="reply-card">
                        <div className="reply-header">
                          <strong>{reply.user?.name ?? 'Unknown user'}</strong>
                          <span>{new Date(reply.created_at).toLocaleString()}</span>
                        </div>

                        <p>{reply.body}</p>

                        {reply.is_internal ? (
                          <span className="internal-note">Internal note</span>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="muted-message">No replies yet.</p>
                )}
              </div>
            </article>
          ) : (
            <>
              <form className="create-ticket-card" onSubmit={handleCreateTicket}>
                <h3>Create a new ticket</h3>

                <label>
                  Title
                  <input
                    type="text"
                    value={newTicketTitle}
                    onChange={(event) => setNewTicketTitle(event.target.value)}
                    placeholder="Example: Cannot access my billing page"
                    required
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={newTicketDescription}
                    onChange={(event) => setNewTicketDescription(event.target.value)}
                    placeholder="Describe the customer issue clearly."
                    required
                  />
                </label>

                <label>
                  Priority
                  <select
                    value={newTicketPriority}
                    onChange={(event) => setNewTicketPriority(event.target.value as TicketPriority)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>

                {createTicketError ? <p className="error-message">{createTicketError}</p> : null}

                {createTicketSuccess ? (
                  <p className="success-message">{createTicketSuccess}</p>
                ) : null}

                <button
                  className="primary-button button-reset"
                  type="submit"
                  disabled={createTicketLoading}
                >
                  {createTicketLoading ? 'Creating...' : 'Create ticket'}
                </button>
              </form>

              {selectedTicketLoading ? (
                <p className="muted-message">Loading ticket details...</p>
              ) : null}

              {selectedTicketError ? <p className="error-message">{selectedTicketError}</p> : null}

              {ticketsLoading ? <p className="muted-message">Loading tickets...</p> : null}

              {ticketsError ? <p className="error-message">{ticketsError}</p> : null}

              {!ticketsLoading && !ticketsError && tickets.length === 0 ? (
                <p className="muted-message">No tickets found for this account.</p>
              ) : null}

              <div className="ticket-grid">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    className="ticket-card ticket-card-button"
                    type="button"
                    onClick={() => handleSelectTicket(ticket.id)}
                  >
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
                      <span>Agent: {ticket.assigned_agent?.name ?? 'Unassigned'}</span>
                      <span>Replies: {ticket.replies?.length ?? 0}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
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