# Dayflow HRMS Backend

A comprehensive Human Resource Management System backend built with Node.js, Express, and PostgreSQL.

## Features

- JWT-based authentication and authorization
- Role-based access control (Admin, HR, Employee)
- Employee profile management
- Attendance tracking (check-in/check-out)
- Leave management with approval workflows
- Payroll/salary management
- Document management

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

## Quick Setup

1. **Install dependencies** (already done ✅):
```bash
npm install
```

2. **Update `.env` file** with your PostgreSQL credentials:
   - Open `.env` and update `DATABASE_URL` with your username and password
   - Format: `postgresql://username:password@localhost:5432/dayflow_db`

3. **Set up database**:
```bash
npm run setup-db
```

4. **(Optional) Seed admin user**:
```bash
npm run seed
```

5. **Start the server**:
```bash
npm run dev
```

📖 **For detailed setup instructions, see [SETUP.md](SETUP.md) or [NEXT_STEPS.md](NEXT_STEPS.md)**

## API Documentation

The API runs on `http://localhost:3000` by default.

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user info

### Employee Endpoints
- `GET /api/employees/:id` - Get employee profile
- `PUT /api/employees/:id` - Update employee profile
- `GET /api/employees` - List all employees (Admin/HR only)

### Attendance Endpoints
- `POST /api/attendance/check-in` - Employee check-in
- `POST /api/attendance/check-out` - Employee check-out
- `GET /api/attendance/my-attendance` - Employee's own attendance
- `GET /api/attendance` - All attendance (Admin/HR, with filters)

### Leave Endpoints
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves/my-leaves` - Employee's leave history
- `GET /api/leaves` - All leave requests (Admin/HR)
- `PATCH /api/leaves/:id/approve` - Approve leave (Admin/HR)
- `PATCH /api/leaves/:id/reject` - Reject leave (Admin/HR)

### Payroll Endpoints
- `GET /api/payroll/my-salary` - Employee's salary (read-only)
- `GET /api/payroll` - All salaries (Admin/HR)
- `GET /api/payroll/:employeeId` - Specific employee salary (Admin/HR)
- `PUT /api/payroll/:employeeId` - Update salary (Admin/HR)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── migrations/      # Database migrations
│   └── app.js           # Express app setup
```

