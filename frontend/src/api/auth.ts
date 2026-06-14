export type UserRole = 'customer' | 'agent' | 'admin';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed.');
  }

  return data as LoginResponse;
}