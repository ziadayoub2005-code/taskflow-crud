# 🚀 TaskFlow — Full Stack CRUD System for Single Resource

[![Node.js](https://img.shields.io/badge/Node.js-v24+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4.21-lightgrey.svg)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v6-purple.svg)](https://vitejs.dev)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57.svg)](https://sqlite.org)

A complete, production-ready Full Stack CRUD Application implementing a **"Task"** resource. Built for the Career180 "Basic Full Stack CRUD for Single Resource" assessment/gig on Freelance Yard.

---

## 📋 Features Overview

- **Full CRUD Operations**:
  - ➕ **Create**: Simple, validated modal form to create tasks with title, description, priority, status, and due date.
  - 👁️ **Read**: View tasks in either a responsive **Cards Grid** or a dense **Data Table**. Modal for full item details.
  - ✏️ **Update**: Edit existing tasks with prepopulated values, or quick-toggle completion status via card checkboxes.
  - 🗑️ **Delete**: Safe deletion with confirmation modal dialog to avoid accidental data loss.
- **RESTful API**: Standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) with JSON responses, input validation, and proper HTTP status codes (`200`, `201`, `400`, `404`, `500`).
- **Persistent Database**: Self-contained SQLite database stored locally in `server/data/tasks.db` with automatic seeding on first launch.
- **Real-Time Feedback**: Interactive toast alerts for all user actions (Create, Update, Delete, Network issues).
- **Search & Filters**: Live search by keyword, filter by status (`pending`, `in_progress`, `completed`), filter by priority (`low`, `medium`, `high`), and multiple sorting criteria.
- **Dashboard Metrics**: Instant progress bar and count cards for total, pending, in-progress, and high-priority tasks.

---

## 🏗️ Architecture & Folder Structure

```text
جيجز/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Modular UI Components
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── StatsBar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskDetailModal.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── TaskTable.jsx
│   │   │   └── Toast.jsx
│   │   ├── api.js              # REST API Client Service
│   │   ├── App.jsx             # Main Application Logic
│   │   ├── index.css           # Modern Design System & CSS tokens
│   │   └── main.jsx            # React Entrypoint
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Vite config with API proxy to port 5001
├── server/                     # Backend Application (Node.js + Express)
│   ├── data/
│   │   └── tasks.db            # SQLite persistent database file
│   ├── src/
│   │   ├── controllers/
│   │   │   └── taskController.js # CRUD handlers & validation logic
│   │   ├── routes/
│   │   │   └── tasks.js        # Express REST API routes
│   │   ├── db.js               # SQLite connection & seed logic
│   │   └── index.js            # Express server entrypoint
│   └── package.json
├── PROPOSAL.md                 # Ready-to-copy Proposal for Freelance Yard (AR & EN)
├── README.md                   # Complete technical documentation
└── package.json                # Monorepo orchestration scripts
```

---

## ⚡ Quick Start Guide (دليل التشغيل السريع)

### 1. Requirements
- Node.js (version 18 or newer recommended, tested on Node v24)
- npm (version 9 or newer)

### 2. Run the Entire Stack with One Command
From the root directory:

```bash
# 1. Install all dependencies (both server and client)
npm run install:all

# 2. Start both backend (port 5001) and frontend (port 5173) concurrently
npm run dev
```

The application will be live at:
- 🌐 **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend REST API**: [http://localhost:5001/api/tasks](http://localhost:5001/api/tasks)
- 🩺 **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 📡 RESTful API Documentation

| Method | Endpoint | Description | Request Body | Response Codes |
|---|---|---|---|---|
| `GET` | `/api/tasks` | Get all tasks (supports `search`, `status`, `priority`, `sortBy`, `order`) | None | `200 OK` |
| `GET` | `/api/tasks/stats` | Get aggregate task statistics & completion rate | None | `200 OK` |
| `GET` | `/api/tasks/:id` | Get single task by ID | None | `200 OK` / `404 Not Found` |
| `POST` | `/api/tasks` | Create a new task | `{ title, description?, status?, priority?, dueDate? }` | `201 Created` / `400 Bad Request` |
| `PUT` | `/api/tasks/:id` | Update an existing task | `{ title?, description?, status?, priority?, dueDate? }` | `200 OK` / `400` / `404 Not Found` |
| `DELETE` | `/api/tasks/:id` | Delete task by ID | None | `200 OK` / `404 Not Found` |
| `GET` | `/api/health` | Backend status & uptime | None | `200 OK` |

### Sample POST Request Payload:
```json
{
  "title": "Prepare Project Documentation",
  "description": "Write comprehensive README with API reference",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-11-05"
}
```

### Sample Response:
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "title": "Prepare Project Documentation",
    "description": "Write comprehensive README with API reference",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-11-05",
    "createdAt": "2026-10-25T00:13:45.111Z",
    "updatedAt": "2026-10-25T00:13:45.111Z"
  }
}
```

---

## 🗄️ Database Schema

The SQLite schema is defined as:

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT CHECK(status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  dueDate TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

---

## 💻 Manual Commands (If Running Separately)

### Backend only:
```bash
cd server
npm install
npm run dev     # Runs on http://localhost:5001
```

### Frontend only:
```bash
cd client
npm install
npm run dev     # Runs on http://localhost:5173
```
