import './App.css';

function App() {
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
            <a href="#demo-accounts" className="primary-button">
              View demo accounts
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
          <h2>Ready for real API login next.</h2>
          <p>
            These accounts are seeded by the Laravel backend and will be used when
            we connect the login form.
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