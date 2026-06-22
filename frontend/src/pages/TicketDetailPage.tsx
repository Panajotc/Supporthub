import { useEffect, useState } from 'react';

import { getAgents } from '../api/agents';
import type { AuthUser } from '../api/auth';
import { uploadTicketAttachment } from '../api/attachments';
import {
  assignTicket,
  createTicketReply,
  getTicket,
  updateTicketStatus,
  type Ticket,
  type TicketStatus,
} from '../api/tickets';
import AppLayout from '../components/AppLayout';

type TicketDetailPageProps = {
  user: AuthUser;
  token: string;
  onLogout: () => void;
};

function formatTicketStatus(status: TicketStatus | null) {
  return status ? status.replaceAll('_', ' ') : 'created';
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function TicketDetailPage({ user, token, onLogout }: TicketDetailPageProps) {
  const ticketId = window.location.pathname.split('/').pop();

  const [agents, setAgents] = useState<AuthUser[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTicketLoading, setSelectedTicketLoading] = useState(false);
  const [selectedTicketError, setSelectedTicketError] = useState<string | null>(null);

  const [newReplyBody, setNewReplyBody] = useState('');
  const [newReplyIsInternal, setNewReplyIsInternal] = useState(false);

  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState<string | null>(null);

  const [newTicketStatus, setNewTicketStatus] = useState<TicketStatus>('open');

  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  const [assignedAgentId, setAssignedAgentId] = useState('unassigned');

  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

  const [selectedAttachment, setSelectedAttachment] = useState<File | null>(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [attachmentSuccess, setAttachmentSuccess] = useState<string | null>(null);

  const numericTicketId = Number(ticketId);

  async function reloadTicket() {
    if (!Number.isInteger(numericTicketId)) {
      setSelectedTicketError('Invalid ticket ID.');
      return;
    }

    const ticketDetails = await getTicket(token, numericTicketId);
    setSelectedTicket(ticketDetails);
  }

  useEffect(() => {
    async function loadTicketDetails() {
      setSelectedTicketLoading(true);
      setSelectedTicketError(null);
      setReplySuccess(null);
      setReplyError(null);
      setStatusSuccess(null);
      setStatusError(null);
      setAssignmentSuccess(null);
      setAssignmentError(null);
      setAttachmentSuccess(null);
      setAttachmentError(null);

      try {
        await reloadTicket();
      } catch (caughtError) {
        setSelectedTicketError(
          caughtError instanceof Error ? caughtError.message : 'Could not load ticket details.',
        );
      } finally {
        setSelectedTicketLoading(false);
      }
    }

    loadTicketDetails();
  }, [token, ticketId]);

  useEffect(() => {
    async function loadAgents() {
      if (user.role === 'customer') {
        setAgents([]);
        setAgentsError(null);
        return;
      }

      setAgentsLoading(true);
      setAgentsError(null);

      try {
        const loadedAgents = await getAgents(token);
        setAgents(loadedAgents);
      } catch (caughtError) {
        setAgentsError(
          caughtError instanceof Error ? caughtError.message : 'Could not load agents.',
        );
      } finally {
        setAgentsLoading(false);
      }
    }

    loadAgents();
  }, [token, user]);

  useEffect(() => {
    if (selectedTicket) {
      setNewTicketStatus(selectedTicket.status);
      setAssignedAgentId(
        selectedTicket.assigned_agent ? String(selectedTicket.assigned_agent.id) : 'unassigned',
      );
    }
  }, [selectedTicket]);

  async function handleCreateReply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTicket) {
      setReplyError('You must select a ticket before replying.');
      return;
    }

    setReplyLoading(true);
    setReplyError(null);
    setReplySuccess(null);

    try {
      await createTicketReply(token, selectedTicket.id, {
        body: newReplyBody,
        is_internal: newReplyIsInternal,
      });

      await reloadTicket();

      setNewReplyBody('');
      setNewReplyIsInternal(false);

      setReplySuccess('Reply added successfully.');
    } catch (caughtError) {
      setReplyError(caughtError instanceof Error ? caughtError.message : 'Could not add reply.');
    } finally {
      setReplyLoading(false);
    }
  }

  async function handleUpdateStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTicket) {
      setStatusError('You must select a ticket before updating status.');
      return;
    }

    setStatusLoading(true);
    setStatusError(null);
    setStatusSuccess(null);

    try {
      await updateTicketStatus(token, selectedTicket.id, {
        status: newTicketStatus,
      });

      await reloadTicket();

      setStatusSuccess('Ticket status updated successfully.');
    } catch (caughtError) {
      setStatusError(
        caughtError instanceof Error ? caughtError.message : 'Could not update ticket status.',
      );
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleAssignTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTicket) {
      setAssignmentError('You must select a ticket before assigning it.');
      return;
    }

    setAssignmentLoading(true);
    setAssignmentError(null);
    setAssignmentSuccess(null);

    try {
      await assignTicket(token, selectedTicket.id, {
        assigned_agent_id: assignedAgentId === 'unassigned' ? null : Number(assignedAgentId),
      });

      await reloadTicket();

      setAssignmentSuccess('Ticket assignment updated successfully.');
    } catch (caughtError) {
      setAssignmentError(
        caughtError instanceof Error ? caughtError.message : 'Could not assign ticket.',
      );
    } finally {
      setAssignmentLoading(false);
    }
  }

  async function handleUploadAttachment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedTicket) {
      setAttachmentError('You must select a ticket before uploading an attachment.');
      return;
    }

    if (!selectedAttachment) {
      setAttachmentError('Choose a file before uploading.');
      return;
    }

    setAttachmentLoading(true);
    setAttachmentError(null);
    setAttachmentSuccess(null);

    try {
      await uploadTicketAttachment(token, selectedTicket.id, selectedAttachment);
      await reloadTicket();

      setSelectedAttachment(null);
      setAttachmentSuccess('Attachment uploaded successfully.');
    } catch (caughtError) {
      setAttachmentError(
        caughtError instanceof Error ? caughtError.message : 'Could not upload attachment.',
      );
    } finally {
      setAttachmentLoading(false);
    }
  }

  return (
    <AppLayout user={user} token={token} onLogout={onLogout}>
      <section className="tickets-section">
        <div className="section-heading">
          <p className="eyebrow">Ticket detail</p>
          <h2>Single ticket workspace.</h2>
          <p>
            This page loads one ticket from <code>GET /api/tickets/{'{id}'}</code>.
            Replies, assignment, status updates, attachments, and status history are managed here.
          </p>
        </div>

        {selectedTicketLoading ? <p className="muted-message">Loading ticket details...</p> : null}

        {selectedTicketError ? <p className="error-message">{selectedTicketError}</p> : null}

        {selectedTicket ? (
          <article className="ticket-detail-card">
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

            {user.role !== 'customer' ? (
              <div className="reply-section">
                <h3>Assign ticket</h3>

                <form className="status-form" onSubmit={handleAssignTicket}>
                  <label>
                    Agent
                    <select
                      value={assignedAgentId}
                      onChange={(event) => setAssignedAgentId(event.target.value)}
                      disabled={agentsLoading}
                    >
                      <option value="unassigned">Unassigned</option>

                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name} — {agent.email}
                        </option>
                      ))}
                    </select>
                  </label>

                  {agentsLoading ? <p className="muted-message">Loading agents...</p> : null}

                  {agentsError ? <p className="error-message">{agentsError}</p> : null}

                  {!agentsLoading && !agentsError && agents.length === 0 ? (
                    <p className="muted-message">No agents are available.</p>
                  ) : null}

                  {assignmentError ? <p className="error-message">{assignmentError}</p> : null}

                  {assignmentSuccess ? <p className="success-message">{assignmentSuccess}</p> : null}

                  <button
                    className="primary-button button-reset"
                    type="submit"
                    disabled={assignmentLoading || agentsLoading}
                  >
                    {assignmentLoading ? 'Assigning...' : 'Update assignment'}
                  </button>
                </form>
              </div>
            ) : null}

            {user.role !== 'customer' ? (
              <div className="reply-section">
                <h3>Update status</h3>

                <form className="status-form" onSubmit={handleUpdateStatus}>
                  <label>
                    Status
                    <select
                      value={newTicketStatus}
                      onChange={(event) => setNewTicketStatus(event.target.value as TicketStatus)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="waiting_for_customer">Waiting for customer</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </label>

                  {statusError ? <p className="error-message">{statusError}</p> : null}

                  {statusSuccess ? <p className="success-message">{statusSuccess}</p> : null}

                  <button
                    className="primary-button button-reset"
                    type="submit"
                    disabled={statusLoading}
                  >
                    {statusLoading ? 'Updating...' : 'Update status'}
                  </button>
                </form>
              </div>
            ) : null}

            <div className="reply-section">
              <h3>Attachments</h3>

              <form className="status-form" onSubmit={handleUploadAttachment}>
                <label>
                  Upload file
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.log"
                    onChange={(event) => {
                      setSelectedAttachment(event.target.files?.[0] ?? null);
                      setAttachmentError(null);
                      setAttachmentSuccess(null);
                    }}
                  />
                </label>

                <p className="muted-message">
                  Allowed files: images, PDFs, text files, and logs. Max size: 5 MB.
                </p>

                {selectedAttachment ? (
                  <p className="muted-message">
                    Selected: {selectedAttachment.name} ({formatFileSize(selectedAttachment.size)})
                  </p>
                ) : null}

                {attachmentError ? <p className="error-message">{attachmentError}</p> : null}

                {attachmentSuccess ? (
                  <p className="success-message">{attachmentSuccess}</p>
                ) : null}

                <button
                  className="primary-button button-reset"
                  type="submit"
                  disabled={attachmentLoading || !selectedAttachment}
                >
                  {attachmentLoading ? 'Uploading...' : 'Upload attachment'}
                </button>
              </form>

              {selectedTicket.attachments && selectedTicket.attachments.length > 0 ? (
                <div className="reply-list">
                  {selectedTicket.attachments.map((attachment) => (
                    <article key={attachment.id} className="reply-card">
                      <div className="reply-header">
                        <strong>{attachment.original_name}</strong>
                        <span>{new Date(attachment.created_at).toLocaleString()}</span>
                      </div>

                      <p>
                        Uploaded by{' '}
                        <strong>{attachment.uploaded_by?.name ?? 'Unknown user'}</strong>
                      </p>

                      <p className="muted-message">
                        {attachment.mime_type} · {formatFileSize(attachment.size)}
                      </p>

                      <a
                        className="secondary-button"
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open file
                      </a>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted-message">No attachments uploaded yet.</p>
              )}
            </div>

            <div className="reply-section">
              <h3>Status history</h3>

              {selectedTicket.status_histories && selectedTicket.status_histories.length > 0 ? (
                <div className="reply-list">
                  {selectedTicket.status_histories.map((history) => (
                    <article key={history.id} className="reply-card">
                      <div className="reply-header">
                        <strong>
                          {formatTicketStatus(history.old_status)} →{' '}
                          {formatTicketStatus(history.new_status)}
                        </strong>
                        <span>{new Date(history.created_at).toLocaleString()}</span>
                      </div>

                      <p>
                        Changed by <strong>{history.changed_by?.name ?? 'Unknown user'}</strong>
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted-message">No status changes recorded yet.</p>
              )}
            </div>

            <div className="reply-section">
              <h3>Add a reply</h3>

              <form className="reply-form" onSubmit={handleCreateReply}>
                <label>
                  Reply message
                  <textarea
                    value={newReplyBody}
                    onChange={(event) => setNewReplyBody(event.target.value)}
                    placeholder="Write a clear support reply."
                    required
                  />
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newReplyIsInternal}
                    onChange={(event) => setNewReplyIsInternal(event.target.checked)}
                  />
                  Internal note
                </label>

                {replyError ? <p className="error-message">{replyError}</p> : null}

                {replySuccess ? <p className="success-message">{replySuccess}</p> : null}

                <button
                  className="primary-button button-reset"
                  type="submit"
                  disabled={replyLoading}
                >
                  {replyLoading ? 'Adding reply...' : 'Add reply'}
                </button>
              </form>
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
        ) : null}
      </section>
    </AppLayout>
  );
}

export default TicketDetailPage;