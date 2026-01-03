# Dayflow HRMS API Testing Guide

This document provides examples for testing all API endpoints.

## Prerequisites

1. Start the server: `npm run dev`
2. Ensure PostgreSQL database is running and migrations are applied
3. Use a tool like Postman, curl, or any HTTP client

## Base URL
```
http://localhost:3000/api
```

## Authentication Endpoints

### 1. Sign Up
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "employee_id": "EMP001",
  "email": "employee@example.com",
  "password": "Employee@123",
  "role": "employee",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "job_title": "Software Engineer",
  "department": "IT",
  "hire_date": "2024-01-15"
}
```

### 2. Sign In
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "employee@example.com",
  "password": "Employee@123"
}

Response includes JWT token in data.token
```

### 3. Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>
```

## Employee Profile Endpoints

### 1. Get Employee Profile
```bash
GET /api/employees/:id
Authorization: Bearer <JWT_TOKEN>
```

### 2. Update Employee Profile
```bash
PUT /api/employees/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "phone": "+9876543210",
  "address": "123 Main St, City"
}
```

### 3. List All Employees (Admin/HR only)
```bash
GET /api/employees?page=1&limit=20&department=IT
Authorization: Bearer <ADMIN_TOKEN>
```

## Attendance Endpoints

### 1. Check In
```bash
POST /api/attendance/check-in
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "date": "2024-01-20"  // Optional, defaults to today
}
```

### 2. Check Out
```bash
POST /api/attendance/check-out
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "date": "2024-01-20"  // Optional, defaults to today
}
```

### 3. Get My Attendance
```bash
GET /api/attendance/my-attendance?startDate=2024-01-01&endDate=2024-01-31&page=1&limit=30
Authorization: Bearer <JWT_TOKEN>
```

### 4. Get All Attendance (Admin/HR only)
```bash
GET /api/attendance?employeeId=<UUID>&startDate=2024-01-01&endDate=2024-01-31&status=present
Authorization: Bearer <ADMIN_TOKEN>
```

## Leave Management Endpoints

### 1. Apply for Leave
```bash
POST /api/leaves
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "leave_type": "paid",
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "remarks": "Family vacation"
}
```

### 2. Get My Leaves
```bash
GET /api/leaves/my-leaves?status=pending&page=1&limit=20
Authorization: Bearer <JWT_TOKEN>
```

### 3. Get All Leaves (Admin/HR only)
```bash
GET /api/leaves?status=pending&employeeId=<UUID>&page=1&limit=20
Authorization: Bearer <ADMIN_TOKEN>
```

### 4. Approve Leave (Admin/HR only)
```bash
PATCH /api/leaves/:id/approve
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "admin_comment": "Approved"
}
```

### 5. Reject Leave (Admin/HR only)
```bash
PATCH /api/leaves/:id/reject
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "admin_comment": "Not enough balance"
}
```

## Payroll Endpoints

### 1. Get My Salary
```bash
GET /api/payroll/my-salary
Authorization: Bearer <JWT_TOKEN>
```

### 2. Get All Salaries (Admin/HR only)
```bash
GET /api/payroll?page=1&limit=20
Authorization: Bearer <ADMIN_TOKEN>
```

### 3. Get Employee Salary (Admin/HR only)
```bash
GET /api/payroll/:employeeId
Authorization: Bearer <ADMIN_TOKEN>
```

### 4. Update Salary (Admin/HR only)
```bash
PUT /api/payroll/:employeeId
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "base_salary": 50000,
  "allowances": {
    "housing": 10000,
    "transport": 5000
  },
  "deductions": {
    "tax": 5000,
    "insurance": 2000
  },
  "effective_from": "2024-02-01"
}
```

## Document Endpoints

### 1. Upload Document
```bash
POST /api/documents
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

file: <file>
document_type: "resume"
```

### 2. Get My Documents
```bash
GET /api/documents/my-documents?page=1&limit=20
Authorization: Bearer <JWT_TOKEN>
```

### 3. Get Document
```bash
GET /api/documents/:id
Authorization: Bearer <JWT_TOKEN>
```

### 4. Delete Document
```bash
DELETE /api/documents/:id
Authorization: Bearer <JWT_TOKEN>
```

## Health Check

```bash
GET /api/health
```

## Testing Scenarios

### Complete Employee Flow

1. **Sign Up** - Create a new employee account
2. **Sign In** - Get JWT token
3. **Get Profile** - View own profile
4. **Update Profile** - Update phone/address
5. **Check In** - Mark attendance
6. **Check Out** - Mark attendance complete
7. **Apply Leave** - Submit leave request
8. **View Leaves** - Check leave status
9. **View Salary** - Check salary details
10. **Upload Document** - Add a document

### Admin Flow

1. **Sign In** - Login as admin
2. **List Employees** - View all employees
3. **View Attendance** - Check all attendance records
4. **Approve Leave** - Approve pending leave requests
5. **Update Salary** - Modify employee salary
6. **View All Salaries** - Check payroll information

## Common Error Responses

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

