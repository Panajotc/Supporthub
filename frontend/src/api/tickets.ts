import type { AuthUser } from './auth';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_for_customer'
  | 'resolved'
  | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export type TicketReply = {
  id: number;
  ticket_id: number;
  user: AuthUser;
  body: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
};

export type Ticket = {
  id: number;
  public_id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer: AuthUser;
  assigned_agent: AuthUser | null;
  created_by: AuthUser | null;
  updated_by: AuthUser | null;
  replies?: TicketReply[];
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TicketListResponse = {
  data: Ticket[];
};

export type TicketResponse = {
  data: Ticket;
};

export type CreateTicketPayload = {
  title: string;
  description: string;
  priority: TicketPriority;
};

export type CreateTicketReplyPayload = {
  body: string;
  is_internal: boolean;
};

export type UpdateTicketStatusPayload = {
  status: TicketStatus;
};

export type AssignTicketPayload = {
  assigned_agent_id: number | null;
};

export type TicketFilters = {
  search?: string;
  status?: TicketStatus | 'all';
  priority?: TicketPriority | 'all';
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getTickets(
  token: string,
  filters: TicketFilters = {},
): Promise<Ticket[]> {
  const queryParams = new URLSearchParams();

  if (filters.search?.trim()) {
    queryParams.set('search', filters.search.trim());
  }

  if (filters.status && filters.status !== 'all') {
    queryParams.set('status', filters.status);
  }

  if (filters.priority && filters.priority !== 'all') {
    queryParams.set('priority', filters.priority);
  }

  const queryString = queryParams.toString();

  const url = queryString
    ? `${API_BASE_URL}/tickets?${queryString}`
    : `${API_BASE_URL}/tickets`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not load tickets.');
  }

  return (data as TicketListResponse).data;
}

export async function getTicket(token: string, ticketId: number): Promise<Ticket> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not load ticket details.');
  }

  return (data as TicketResponse).data;
}

export async function createTicket(
  token: string,
  payload: CreateTicketPayload,
): Promise<Ticket> {
  const response = await fetch(`${API_BASE_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not create ticket.');
  }

  return (data as TicketResponse).data;
}

export async function createTicketReply(
  token: string,
  ticketId: number,
  payload: CreateTicketReplyPayload,
): Promise<Ticket> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/replies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not create reply.');
  }

  return (data as TicketResponse).data;
}

export async function updateTicketStatus(
  token: string,
  ticketId: number,
  payload: UpdateTicketStatusPayload,
): Promise<Ticket> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not update ticket status.');
  }

  return (data as TicketResponse).data;
}

export async function assignTicket(
  token: string,
  ticketId: number,
  payload: AssignTicketPayload,
): Promise<Ticket> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not assign ticket.');
  }

  return (data as TicketResponse).data;
}