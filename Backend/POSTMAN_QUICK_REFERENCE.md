# Postman Quick Reference - Dayflow HRMS API

## 🔗 Base URL
```
http://localhost:3000/api
```

## 🔑 Authentication
All protected endpoints require:
- **Header**: `Authorization: Bearer {{token}}`

## 📋 Endpoints Quick Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/auth/signup` | ❌ | Register new user |
| POST | `/auth/signin` | ❌ | Login (get token) |
| GET | `/auth/me` | ✅ | Get current user |

### Employee Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/employees/:id` | ✅ | Get profile |
| PUT | `/employees/:id` | ✅ | Update profile |
| GET | `/employees` | ✅ Admin/HR | List all employees |

### Attendance
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/attendance/check-in` | ✅ | Check in |
| POST | `/attendance/check-out` | ✅ | Check out |
| GET | `/attendance/my-attendance` | ✅ | My attendance |
| GET | `/attendance` | ✅ Admin/HR | All attendance |

### Leave Management
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/leaves` | ✅ | Apply for leave |
| GET | `/leaves/my-leaves` | ✅ | My leave history |
| GET | `/leaves` | ✅ Admin/HR | All leave requests |
| PATCH | `/leaves/:id/approve` | ✅ Admin/HR | Approve leave |
| PATCH | `/leaves/:id/reject` | ✅ Admin/HR | Reject leave |

### Payroll
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payroll/my-salary` | ✅ | My salary |
| GET | `/payroll` | ✅ Admin/HR | All salaries |
| GET | `/payroll/:employeeId` | ✅ Admin/HR | Employee salary |
| PUT | `/payroll/:employeeId` | ✅ Admin/HR | Update salary |

### Documents
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/documents` | ✅ | Upload document |
| GET | `/documents/my-documents` | ✅ | My documents |
| GET | `/documents/:id` | ✅ | Get document |
| DELETE | `/documents/:id` | ✅ | Delete document |

## 🔐 Test Credentials

### Admin
```
Email: admin@dayflow.com
Password: Admin@123
Employee ID: ADMIN001
```

### Test Employee (create via signup)
```
Email: employee1@test.com
Password: Employee@123
Employee ID: EMP001
```

## 📝 Sample Request Bodies

### Sign Up
```json
{
  "employee_id": "EMP001",
  "email": "employee1@test.com",
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

### Sign In
```json
{
  "email": "employee1@test.com",
  "password": "Employee@123"
}
```

### Apply Leave
```json
{
  "leave_type": "paid",
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "remarks": "Family vacation"
}
```

### Update Salary (Admin)
```json
{
  "base_salary": 50000,
  "allowances": {
    "housing": 10000,
    "transport": 5000
  },
  "deductions": {
    "tax": 5000,
    "insurance": 2000
  }
}
```

## ✅ Success Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## ❌ Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## 🔄 Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Server Error

## 💾 Environment Variables (Postman)
```
base_url = http://localhost:3000/api
token = (auto-filled after sign in)
admin_token = (auto-filled after admin sign in)
```

## 🚀 Testing Order
1. Health Check
2. Sign Up
3. Sign In → Save token
4. Get Current User
5. Get/Update Profile
6. Check In/Out
7. Apply Leave
8. Sign In as Admin → Save admin_token
9. Approve Leave
10. Update Salary
11. Upload Document

---

**For detailed step-by-step instructions, see `POSTMAN_TESTING_GUIDE.md`**

