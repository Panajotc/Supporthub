import type { AuthUser } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type AgentListResponse = {
  data: AuthUser[];
};

export async function getAgents(token: string): Promise<AuthUser[]> {
  const response = await fetch(`${API_BASE_URL}/agents`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not load agents.');
  }

  return (data as AgentListResponse).data;
}