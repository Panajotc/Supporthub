# Database Design

This document describes the initial MVP database schema for SupportHub.

## Main Entities

- Users
- Tickets
- Ticket Replies
- Ticket Status Histories

## Users

Users represent customers, agents, and admins.

Fields:

- id
- name
- email
- password
- role
- created_at
- updated_at

Roles:

- customer
- agent
- admin

## Tickets

Tickets represent support requests created by customers.

Fields:

- id
- public_id
- title
- description
- status
- priority
- customer_id
- assigned_agent_id
- created_by
- updated_by
- resolved_at
- closed_at
- created_at
- updated_at

Notes:

- `public_id` is the customer-facing ticket reference.
- `customer_id` points to the user who owns the support request.
- `assigned_agent_id` is nullable because a ticket can exist before assignment.
- `created_by` and `updated_by` support auditability.

## Ticket Replies

Ticket replies represent messages added to a ticket conversation.

Fields:

- id
- ticket_id
- user_id
- body
- is_internal
- created_at
- updated_at

Notes:

- Public replies are visible to the customer.
- Internal replies are only visible to agents and admins.
- The `is_internal` column is included early because internal notes are planned for Version 2.

## Ticket Status Histories

Ticket status histories track status changes for auditability.

Fields:

- id
- ticket_id
- old_status
- new_status
- changed_by
- created_at

Notes:

- This table allows the system to answer who changed a ticket status and when.
- This supports future analytics and support reporting.
