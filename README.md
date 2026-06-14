# SupportHub

![Backend Tests](https://github.com/Panajotc/Supporthub/actions/workflows/backend-tests.yml/badge.svg)

SupportHub is a production-style customer support ticketing API built as a portfolio project for technical support, application support, solutions engineering, and Laravel backend development roles.

The project models a support workflow where customers create tickets, agents respond to issues, tickets move through statuses, and support teams can assign ownership.

## Tech Stack

- Backend: Laravel 12, PHP 8.4
- Database: MySQL 8
- Authentication: Laravel Sanctum
- Testing: PHPUnit / Laravel Feature Tests
- CI: GitHub Actions
- API style: REST JSON API

## Current Features

- Customer registration and login
- Token-based API authentication
- Role-based users: customer, agent, admin
- Ticket creation
- Ticket listing
- Ticket detail view
- Ticket replies
- Ticket status updates
- Ticket assignment to agents
- Ticket status history tracking
- API resources for consistent JSON responses
- Automated backend test suite
- GitHub Actions workflow for backend tests

## Backend API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| POST | `/api/register` | Register a customer |
| POST | `/api/login` | Login and receive an API token |
| GET | `/api/me` | Get authenticated user |
| POST | `/api/logout` | Logout and revoke current token |
| GET | `/api/tickets` | List tickets |
| POST | `/api/tickets` | Create a ticket |
| GET | `/api/tickets/{ticket}` | View ticket details |
| POST | `/api/tickets/{ticket}/replies` | Add a ticket reply |
| PATCH | `/api/tickets/{ticket}/status` | Update ticket status |
| PATCH | `/api/tickets/{ticket}/assign` | Assign ticket to an agent |

## Local Setup

Clone the repository:

```bash
git clone https://github.com/Panajotc/Supporthub.git
cd Supporthub
```

Install backend dependencies:

```bash
cd backend
composer install
```

Create the environment file:

```bash
cp .env.example .env
```

Generate the Laravel app key:

```bash
php artisan key:generate
```

Configure your database in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=supporthub
DB_USERNAME=root
DB_PASSWORD=
```

Run migrations and seed demo data:

```bash
php artisan migrate:fresh --seed
```

Start the API server:

```bash
php artisan serve --host=127.0.0.1 --port=8080
```

The API will be available at:

```txt
http://127.0.0.1:8080
```

## Demo Users

The database seeder creates demo users:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@supporthub.test` | `password` |
| Agent | `agent@supporthub.test` | `password` |
| Customer | `customer@supporthub.test` | `password` |

## Running Tests

Run the backend test suite:

```bash
cd backend
php artisan test
```

Current test coverage includes:

- Authentication API
- Ticket listing
- Ticket creation
- Ticket detail view
- Ticket replies
- Ticket status updates
- Ticket assignment
- Role-based access restrictions

## Continuous Integration

This project uses GitHub Actions to run backend tests automatically on pushes and pull requests to `main` and `develop`.

Workflow file:

```txt
.github/workflows/backend-tests.yml
```

## Project Status

SupportHub is currently focused on the backend API. A React frontend will be added after the backend workflow is stable and well tested.

## Portfolio Purpose

This project is designed to demonstrate practical backend engineering skills:

- Building REST APIs
- Designing relational data models
- Implementing authentication and authorization
- Working with role-based workflows
- Writing automated feature tests
- Using Git and GitHub branch workflows
- Running tests in CI
- Documenting a project clearly