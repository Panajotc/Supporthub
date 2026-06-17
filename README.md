# SupportHub

![Backend Tests](https://github.com/Panajotc/Supporthub/actions/workflows/backend-tests.yml/badge.svg)

SupportHub is a full-stack customer support ticketing app built as a portfolio project for technical support, application support, solutions engineering, and full-stack web development roles.

The project models a realistic support workflow where customers create tickets, agents respond to issues, tickets move through statuses, and support teams can assign ownership.

## Demo Workflow

## Screenshots

### Login Screen

![SupportHub login screen](docs/screenshots/login.png)

### Ticket Dashboard

![SupportHub ticket dashboard](docs/screenshots/tickets.png)

### Ticket Detail

![SupportHub ticket detail screen](docs/screenshots/ticket-detail.png)


SupportHub currently supports a working end-to-end support flow:

* Login with seeded demo users
* List tickets from the Laravel API
* Create new tickets from the React frontend
* View ticket details
* Add ticket replies
* Update ticket status
* Assign tickets to an agent
* Track ticket status history on the backend

## Tech Stack

### Backend

* Laravel 12
* PHP 8.4
* MySQL 8
* Laravel Sanctum
* PHPUnit / Laravel Feature Tests
* GitHub Actions CI
* REST JSON API

### Frontend

* React
* TypeScript
* Vite
* CSS

## Current Features

* Customer registration and login
* Token-based API authentication
* Role-based users: customer, agent, admin
* Ticket creation
* Ticket listing
* Ticket detail view
* Ticket replies
* Ticket status updates
* Ticket assignment to agents
* Ticket status history tracking
* API resources for consistent JSON responses
* React frontend connected to the Laravel API
* Automated backend test suite
* GitHub Actions workflow for backend tests

## Backend API Endpoints

| Method | Endpoint                        | Description                     |
| ------ | ------------------------------- | ------------------------------- |
| GET    | `/api/health`                   | API health check                |
| POST   | `/api/register`                 | Register a customer             |
| POST   | `/api/login`                    | Login and receive an API token  |
| GET    | `/api/me`                       | Get authenticated user          |
| POST   | `/api/logout`                   | Logout and revoke current token |
| GET    | `/api/tickets`                  | List tickets                    |
| POST   | `/api/tickets`                  | Create a ticket                 |
| GET    | `/api/tickets/{ticket}`         | View ticket details             |
| POST   | `/api/tickets/{ticket}/replies` | Add a ticket reply              |
| PATCH  | `/api/tickets/{ticket}/status`  | Update ticket status            |
| PATCH  | `/api/tickets/{ticket}/assign`  | Assign ticket to an agent       |

## Demo Users

The database seeder creates these demo users:

| Role     | Email                      | Password   |
| -------- | -------------------------- | ---------- |
| Admin    | `admin@supporthub.test`    | `password` |
| Agent    | `agent@supporthub.test`    | `password` |
| Customer | `customer@supporthub.test` | `password` |

## Local Setup

Clone the repository:

```bash
git clone https://github.com/Panajotc/Supporthub.git
cd Supporthub
```

## Backend Setup

Install backend dependencies:

```bash
cd backend
composer install
```

Create the environment file:

```bash
cp .env.example .env
```

On Windows Command Prompt, use:

```cmd
copy .env.example .env
```

Generate the Laravel app key:

```bash
php artisan key:generate
```

Configure your database in `backend/.env`:

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
php artisan serve --host=127.0.0.1 --port=8080 --no-reload
```

The API will be available at:

```txt
http://127.0.0.1:8080/api
```

## Frontend Setup

In a second terminal, install frontend dependencies:

```bash
cd frontend
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env
```

On Windows Command Prompt, use:

```cmd
copy .env.example .env
```

The frontend `.env` file should contain:

```env
VITE_API_BASE_URL=http://127.0.0.1:8080/api
```

Start the React development server:

```bash
npm run dev
```

The frontend will run at the Vite development URL shown in the terminal, usually:

```txt
http://localhost:5173
```

## Running Tests

Run the backend test suite:

```bash
cd backend
php artisan test
```

Current test coverage includes:

* Authentication API
* Ticket listing
* Ticket creation
* Ticket detail view
* Ticket replies
* Ticket status updates
* Ticket assignment
* Role-based access restrictions

## Building the Frontend

Run the frontend production build:

```bash
cd frontend
npm run build
```

## Continuous Integration

This project uses GitHub Actions to run backend tests automatically on pushes and pull requests to `main` and `develop`.

Workflow file:

```txt
.github/workflows/backend-tests.yml
```

## Project Status

SupportHub is an active MVP with a working Laravel backend and React frontend.

The current version demonstrates a real-world support workflow with authentication, authorization, ticket management, replies, status updates, assignment, backend testing, and CI.

## Portfolio Purpose

This project is designed to demonstrate practical engineering skills:

* Building REST APIs
* Designing relational data models
* Implementing authentication and authorization
* Working with role-based support workflows
* Connecting a React frontend to a Laravel API
* Managing frontend state with TypeScript
* Writing automated feature tests
* Using Git and GitHub branch workflows
* Running tests in CI
* Documenting a project clearly
