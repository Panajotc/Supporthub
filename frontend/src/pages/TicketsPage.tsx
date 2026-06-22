import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { AuthUser } from '../api/auth';
import {
  createTicket,
  getTickets,
  type Ticket,
  type TicketPaginationMeta,
  type TicketPriority,
  type TicketSort,
  type TicketStatus,
} from '../api/tickets';
import AppLayout from '../components/AppLayout';

type TicketsPageProps = {
  user: AuthUser;
  token: string;
  onLogout: () => void;
};

function TicketsPage({ user, token, onLogout }: TicketsPageProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketPagination, setTicketPagination] = useState<TicketPaginationMeta | null>(null);
  const [currentTicketPage, setCurrentTicketPage] = useState(1);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const [ticketSearch, setTicketSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [ticketSort, setTicketSort] = useState<TicketSort>('newest');

  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<TicketPriority>('medium');

  const [createTicketLoading, setCreateTicketLoading] = useState(false);
  const [createTicketError, setCreateTicketError] = useState<string | null>(null);
  const [createTicketSuccess, setCreateTicketSuccess] = useState<string | null>(null);

  const hasActiveFilters =
    ticketSearch.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    ticketSort !== 'newest';

  function handleClearFilters() {
    setTicketSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setTicketSort('newest');
    setCurrentTicketPage(1);
  }

  async function reloadTickets(page = currentTicketPage) {
    const result = await getTickets(token, {
      search: ticketSearch,
      status: statusFilter,
      priority: priorityFilter,
      sort: ticketSort,
      page,
    });

    setTickets(result.tickets);
    setTicketPagination(result.meta);
  }

  useEffect(() => {
    async function loadTickets() {
      setTicketsLoading(true);
      setTicketsError(null);

      try {
        await reloadTickets();
      } catch (caughtError) {
        setTicketsError(
          caughtError instanceof Error ? caughtError.message : 'Could not load tickets.',
        );
      } finally {
        setTicketsLoading(false);
      }
    }

    loadTickets();
  }, [token, ticketSearch, statusFilter, priorityFilter, ticketSort, currentTicketPage]);

  async function handleCreateTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreateTicketLoading(true);
    setCreateTicketError(null);
    setCreateTicketSuccess(null);

    try {
      await createTicket(token, {
        title: newTicketTitle,
        description: newTicketDescription,
        priority: newTicketPriority,
      });

      setCurrentTicketPage(1);
      await reloadTickets(1);

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

  return (
    <AppLayout user={user} token={token} onLogout={onLogout}>
      <section className="tickets-section">
        <div className="section-heading">
          <p className="eyebrow">Ticket dashboard</p>
          <h2>Tickets from the Laravel API.</h2>
          <p>
            This page loads tickets from <code>GET /api/tickets</code>. Filters,
            sorting, and pagination are sent to the backend as query parameters.
          </p>
        </div>

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

          {createTicketSuccess ? <p className="success-message">{createTicketSuccess}</p> : null}

          <button
            className="primary-button button-reset"
            type="submit"
            disabled={createTicketLoading}
          >
            {createTicketLoading ? 'Creating...' : 'Create ticket'}
          </button>
        </form>

        <div className="ticket-filter-card">
          <h3>Filter tickets</h3>

          <div className="ticket-filter-grid">
            <label>
              Search
              <input
                type="search"
                value={ticketSearch}
                onChange={(event) => {
                  setTicketSearch(event.target.value);
                  setCurrentTicketPage(1);
                }}
                placeholder="Search by ID, title, or description"
              />
            </label>

            <label>
              Status
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as TicketStatus | 'all');
                  setCurrentTicketPage(1);
                }}
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="waiting_for_customer">Waiting for customer</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <label>
              Priority
              <select
                value={priorityFilter}
                onChange={(event) => {
                  setPriorityFilter(event.target.value as TicketPriority | 'all');
                  setCurrentTicketPage(1);
                }}
              >
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>

            <label>
              Sort
              <select
                value={ticketSort}
                onChange={(event) => {
                  setTicketSort(event.target.value as TicketSort);
                  setCurrentTicketPage(1);
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="priority_high">Highest priority first</option>
                <option value="priority_low">Lowest priority first</option>
              </select>
            </label>
          </div>

          <div className="ticket-filter-actions">
            <p>
              Showing{' '}
              <strong>
                {ticketPagination?.from ?? 0}-{ticketPagination?.to ?? 0}
              </strong>{' '}
              of <strong>{ticketPagination?.total ?? tickets.length}</strong> matching tickets.
            </p>

            <button
              className="secondary-button button-reset"
              type="button"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          </div>
        </div>

        {ticketsLoading ? <p className="muted-message">Loading tickets...</p> : null}

        {ticketsError ? <p className="error-message">{ticketsError}</p> : null}

        {!ticketsLoading && !ticketsError && tickets.length === 0 && !hasActiveFilters ? (
          <p className="muted-message">No tickets found for this account.</p>
        ) : null}

        {!ticketsLoading && !ticketsError && tickets.length === 0 && hasActiveFilters ? (
          <p className="muted-message">No tickets match the current filters.</p>
        ) : null}

        <div className="ticket-grid">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              className="ticket-card ticket-card-button"
              to={`/tickets/${ticket.id}`}
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
            </Link>
          ))}
        </div>

        {ticketPagination && ticketPagination.last_page > 1 ? (
          <div className="pagination-card">
            <button
              className="secondary-button button-reset"
              type="button"
              disabled={ticketsLoading || ticketPagination.current_page <= 1}
              onClick={() => setCurrentTicketPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>

            <span>
              Page <strong>{ticketPagination.current_page}</strong> of{' '}
              <strong>{ticketPagination.last_page}</strong>
            </span>

            <button
              className="secondary-button button-reset"
              type="button"
              disabled={ticketsLoading || ticketPagination.current_page >= ticketPagination.last_page}
              onClick={() =>
                setCurrentTicketPage((page) =>
                  ticketPagination ? Math.min(ticketPagination.last_page, page + 1) : page,
                )
              }
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </AppLayout>
  );
}

export default TicketsPage;