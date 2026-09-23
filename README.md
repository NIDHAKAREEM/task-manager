# Task Manager

A full-stack task management application built with Angular and Node.js.

## Tech Stack

**Frontend:** Angular 17, TypeScript, Tailwind CSS, RxJS

**Backend:** Node.js, Express.js, MongoDB, Redis, JWT Authentication

## Features

- User authentication (signup/login) with JWT
- Create, read, update, and delete tasks
- Toggle task status (pending/completed)
- Filter tasks by status
- Redis caching for improved API performance
- Responsive UI with Tailwind CSS

## Project Structure

```
task-manager/
├── client/          # Angular frontend
│   └── src/app/
│       ├── core/        # Services, guards, interceptors, models
│       ├── shared/      # Navbar, pipes
│       └── features/    # Auth, tasks, profile components
└── server/          # Node.js backend
    └── src/
        ├── config/      # Database and Redis configuration
        ├── middleware/   # JWT auth middleware
        └── models/      # Mongoose schemas
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Redis

### Backend

```bash
cd server
npm install
node server.js
```

Server runs on `http://localhost:3000`

### Frontend

```bash
cd client
npm install
ng serve
```

App runs on `http://localhost:4200`

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/signup | Register a new user | No |
| POST | /auth/login | Login and get JWT token | No |
| GET | /profile | Get user profile | Yes |
| GET | /tasks | Get all tasks (Redis cached) | Yes |
| POST | /tasks | Create a new task | Yes |
| PUT | /tasks/:id | Update a task | Yes |
| DELETE | /tasks/:id | Delete a task | Yes |
