# API Design

SupportHub exposes a REST API from the Laravel backend.

## API Principles

- Use predictable REST endpoints.
- Use JSON request and response bodies.
- Protect authenticated routes with Laravel Sanctum.
- Keep controllers thin.
- Use Form Requests for validation.
- Use Policies for authorization.
- Use API Resources for response formatting.

## Authentication

```txt
POST   /api/register
POST   /api/login
POST   /api/logout
GET    /api/me
```
