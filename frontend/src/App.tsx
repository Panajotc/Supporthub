import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import './App.css';
import { login, type AuthUser } from './api/auth';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import TicketDetailPage from './pages/TicketDetailPage';
import TicketsPage from './pages/TicketsPage';

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
    setEmail('agent@supporthub.test');
    setPassword('password');
    setError(null);
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user && token ? '/dashboard' : '/login'} replace />}
      />

      <Route
        path="/login"
        element={
          <LoginPage
            user={user}
            email={email}
            password={password}
            isLoading={isLoading}
            error={error}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          user && token ? (
            <DashboardPage token={token} user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/tickets"
        element={
          user && token ? (
            <TicketsPage user={user} token={token} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/tickets/:ticketId"
        element={
          user && token ? (
            <TicketDetailPage user={user} token={token} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;