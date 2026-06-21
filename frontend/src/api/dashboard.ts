export type DashboardStats = {
  open_tickets: number;
  closed_tickets: number;
  high_priority_tickets: number;
  assigned_tickets: number;
};

type DashboardStatsResponse = {
  data: DashboardStats;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load dashboard stats.');
  }

  return (data as DashboardStatsResponse).data;
}