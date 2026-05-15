# Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking progress with role-based access control.

## Live URL
> To be updated after Railway deployment

## Features

- **Authentication** – Signup, Login, JWT-based auth with refresh tokens
- **Role-Based Access Control** – Admin and Member roles per project
- **Project Management** – Create, update, delete projects; manage team members
- **Task Management** – Create tasks, assign to members, set priorities and due dates
- **Status Tracking** – Todo, In Progress, Review, Done
- **Dashboard** – Overview of tasks, statuses, overdue items with charts

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- JWT Authentication (access + refresh tokens)
- Express Validator
- Bcrypt for password hashing

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios + TanStack Query
- Recharts (dashboard charts)

## Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/         # DB and app config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic layer
│   │   └── utils/          # Helpers and constants
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instances and API calls
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   └── utils/          # Helpers
│   ├── index.html
│   └── package.json
└── docker-compose.yml
```

## Setup & Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend
```bash
cd backend
cp .env.example .env
# Fill in your DB credentials and JWT secrets
npm install
npm run db:migrate
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend `.env`
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## Deployment (Railway)

1. Push repo to GitHub
2. Create new Railway project → Add PostgreSQL service
3. Deploy backend: connect repo, set env vars, set start command `node server.js`
4. Deploy frontend: set `VITE_API_URL` to backend Railway URL, build command `npm run build`
