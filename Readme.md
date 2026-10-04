# Task Management System — Backend

A role-based task management API built with Node.js, Express, and PostgreSQL. Admins manage employees and assign tasks; employees view and update the status of tasks assigned to them.

Built as a self-directed learning project — designed and implemented from scratch, including schema design, authentication, authorization, and access-control decisions.

---

## Features

- **Role-based authentication** (admin / employee) via JWT stored in an HTTP-only cookie
- **Admin capabilities:** create, read, update, deactivate, reactivate, and delete employees; create, read, update, and delete tasks; assign one or multiple tasks per employee
- **Employee capabilities:** view own profile and update own details/password; view assigned tasks and update their status (`pending` / `completed` / `not_completed`, with a required reason when marked not completed)
- **Soft deletion** for employees (deactivate/reactivate) alongside an explicit hard-delete path, with a deliberate guard preventing hard deletion of employees who still have tasks assigned
- Passwords hashed with bcrypt; never stored or returned in plaintext
- Parameterized SQL queries throughout to prevent injection

---

## Tech Stack

- **Runtime:** Node.js, Express.js
- **Database:** PostgreSQL (`pg`)
- **Auth:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs` for password hashing
- **Other:** `cookie-parser`, `cors`, `dotenv`, `helmet` ,`nodemon` (dev)

---

## Project Structure

```
config/
  db.js                     # PostgreSQL connection pool
controllers/
  authController.js         # login, logout, change password
  adminController.js        # employee CRUD, deactivate/reactivate
  adminTaskController.js    # task CRUD (admin)
  employeeController.js     # self-service profile (employee)
  employeeTaskController.js # self-service task view/update (employee)
middlewares/
  authMiddleware.js         # isAuthenticated, isAdmin, isEmployee
routes/
  auth.js
  admin.js
  adminTask.js
  employee.js
  employeeTask.js
constant.js                 # centralized route path constants
index.js                    # app entry point
```

---

## Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd task-management-system
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in real values:

```
PORT = 3000
DB_USER = your_db_user
DB_PASSWORD = your_db_password
DB_HOST = localhost
DB_PORT = 5433
DB_DATABASE = taskdb
JWT_SECRET = your_random_secret
```

Generate a strong `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Set up the database

Run the following in your PostgreSQL instance:

```sql
CREATE EXTENSION pgcrypto;

CREATE TYPE USER_ROLE AS ENUM('admin', 'employee');
CREATE TYPE DEPARTMENT_TYPE AS ENUM('IT', 'SALES', 'SUPPORT');
CREATE TYPE DESIGNATION_TYPE AS ENUM(
  'frontend developer','backend developer','full stack developer',
  'web designer','accountant','project manager','devops engineer'
);
CREATE TYPE USER_STATE AS ENUM('active', 'deactivated');
CREATE TYPE TASK_STATE AS ENUM('pending', 'completed', 'not_completed');

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role USER_ROLE DEFAULT 'employee' NOT NULL,
  department DEPARTMENT_TYPE DEFAULT 'IT' NOT NULL,
  designation DESIGNATION_TYPE NOT NULL,
  state USER_STATE DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_tasks(
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES users(id) NOT NULL,
  task_title VARCHAR(100) NOT NULL,
  task_description TEXT,
  task_state TASK_STATE DEFAULT 'pending' NOT NULL,
  state_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Seed the first admin

There's no public registration endpoint by design — employee accounts are created by an admin, and admins aren't self-service. Seed the first admin directly:

```sql
INSERT INTO users (name, email, password_hash, role, department, designation)
VALUES (
  'Your Name',
  'you@example.com',
  crypt('your-password', gen_salt('bf')),
  'admin',
  'IT',
  'project manager'
);
```

### 5. Run the server

```bash
npm run dev
```

---

## API Endpoints

### Auth (`/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Log in, sets JWT cookie |
| POST | `/logout` | Public | Clears the auth cookie |
| PUT | `/changePassword` | Authenticated | Change your own password |

### Admin — Employees (`/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/createEmployee` | Admin | Create a new employee |
| GET | `/getAllEmployees` | Admin | List all active employees |
| GET | `/getEmployeeById/:id` | Admin | Get one employee |
| PUT | `/updateEmployee/:id` | Admin | Partially update employee details |
| PUT | `/deactivateEmployee/:id` | Admin | Soft-delete (deactivate) |
| PUT | `/reactivateEmployee/:id` | Admin | Restore a deactivated employee |
| DELETE | `/deleteEmployee/:id` | Admin | Hard-delete (blocked if tasks exist) |

### Employee — Self-service (`/employee`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/getMyDetails` | Employee | View own profile |
| PUT | `/updateMyDetails` | Employee | Partially update own name/email/password |

### Admin — Tasks (`/adminTask`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/getAllTasks` | Admin | List all tasks, joined with employee info |
| GET | `/getTaskById/:id` | Admin | Get one task |
| POST | `/createTaskById/:id` | Admin | Create a task for one employee |
| PUT | `/updateTaskById/:id` | Admin | Edit a task's title/description |
| DELETE | `/deleteTaskById/:id` | Admin | Delete one task |
| GET | `/getTasksByEmployeeId/:id` | Admin | List all tasks for one employee |
| DELETE | `/deleteTasksByEmployeeId/:id` | Admin | Delete all tasks for one employee |

### Employee — Tasks (`/employeeTask`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/getMyTask` | Employee | View tasks assigned to you |
| PUT | `/updateMyTask` | Employee | Update your own task's status/reason |

---

## Design Notes

- **No public registration.** Employees are created by an admin; this reflects the intended real-world workflow and avoids privilege-escalation risk from a client-controlled `role` field.
- **Role never comes from client input.** Every account's role is set server-side.
- **Tasks are one-to-one with an employee**, not shared across multiple employees — each assignment is its own row.
- **Admin updates are a dynamic partial patch** (only submitted fields are changed); employee self-updates and task-status updates use a fixed, explicitly whitelisted set of columns to prevent privilege escalation through an open-ended update.
- **Hard deletion is intentionally blocked** for employees with existing tasks, to preserve task history; soft deletion (deactivate) is the default path for removing someone from active use.

---

## License

For personal/educational use.