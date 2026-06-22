export type TicketNotification = {
  id: number;
  type: string;
  message: string;
  ticket: {
    id: number;
    public_id: string;
    title: string;
  };
  read_at: string | null;
  created_at: string;
};

type TicketNotificationsResponse = {
  data: TicketNotification[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getNotifications(token: string): Promise<TicketNotification[]> {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to load notifications.');
  }

  return (data as TicketNotificationsResponse).data;
}