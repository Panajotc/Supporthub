# Architecture Decisions

This document records important technical decisions made during the SupportHub project.

## Decision 001: Use a monorepo

SupportHub uses a monorepo with separate `backend` and `frontend` folders.

### Reason

A monorepo makes the project easier to review as a portfolio project. It keeps the full-stack system in one repository and allows the Git history to show backend, frontend, and documentation progress together.

### Tradeoff

In larger teams, separate repositories can offer clearer ownership and independent deployment workflows. For this project, the simplicity and reviewability of a monorepo are more valuable.

## Decision 002: Use Laravel as a REST API

The Laravel application will serve as an API-only backend.

### Reason

This keeps the backend and frontend clearly separated and reflects a common modern SaaS architecture.

### Tradeoff

Laravel can also render frontend views directly using Blade or Inertia. For this project, a separate React frontend better demonstrates full-stack API-driven development.

## Decision 003: Use simple role-based access control first

The MVP will use a `role` column on the `users` table instead of a full permissions package.

### Reason

The initial roles are simple:

- customer
- agent
- admin

A full permissions package would add unnecessary complexity at the beginning.

### Tradeoff

If SupportHub later needs granular permissions, a package such as `spatie/laravel-permission` could be introduced.

## Decision 004: Include ticket status history in the MVP

SupportHub will include ticket status history from the first ticket workflow implementation.

### Reason

Support systems need auditability. The application should be able to show when a ticket changed status and who made the change.

### Tradeoff

This adds one extra table and some additional business logic, but it improves realism and supports future analytics.
