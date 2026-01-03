# Postman Testing Guide - Dayflow HRMS API

## 📋 Table of Contents
1. [Postman Setup](#postman-setup)
2. [Testing Order](#testing-order)
3. [Step-by-Step Testing](#step-by-step-testing)

---

## Postman Setup

### 1. Create a New Collection
1. Open Postman
2. Click **"New"** → **"Collection"**
3. Name it: **"Dayflow HRMS API"**
4. Click **"Create"**

### 2. Create Environment Variables
1. Click the **"Environments"** icon (left sidebar)
2. Click **"+"** to create new environment
3. Name it: **"Dayflow Local"**
4. Add these variables:
   - `base_url` = `http://localhost:3000/api`
   - `token` = (leave empty, will be set automatically)
5. Click **"Save"**
6. Select this environment from the dropdown (top right)

---

## Testing Order

Test endpoints in this order:
1. ✅ Health Check (no auth needed)
2. ✅ Sign Up (create a test employee)
3. ✅ Sign In (get JWT token)
4. ✅ Get Current User (test auth)
5. ✅ Employee Profile (view/update)
6. ✅ Attendance (check-in/check-out)
7. ✅ Leave Management (apply, approve)
8. ✅ Payroll (view salary)
9. ✅ Documents (upload)

---

## Step-by-Step Testing

### 🟢 STEP 1: Health Check (No Authentication)

**Purpose**: Verify server is running

1. **Create Request**:
   - In your collection, click **"Add Request"**
   - Name: `1. Health Check`
   - Method: **GET**
   - URL: `{{base_url}}/health`

2. **Send Request**:
   - Click **"Send"**

3. **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-03T..."
}
```

✅ **If you see this, server is working!**

---

### 🟢 STEP 2: Sign Up (Create Test Employee)

**Purpose**: Create a new employee account

1. **Create Request**:
   - Name: `2. Sign Up - Employee`
   - Method: **POST**
   - URL: `{{base_url}}/auth/signup`

2. **Set Headers**:
   - Key: `Content-Type`
   - Value: `application/json`

3. **Set Body** (select "raw" → "JSON"):
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

4. **Send Request**

5. **Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "id": "uuid-here",
    "employee_id": "EMP001",
    "email": "employee1@test.com",
    "role": "employee",
    "email_verified": false
  }
}
```

✅ **Save the user ID for later use!**

---

### 🟢 STEP 3: Sign In (Get JWT Token)

**Purpose**: Get authentication token

1. **Create Request**:
   - Name: `3. Sign In - Employee`
   - Method: **POST**
   - URL: `{{base_url}}/auth/signin`

2. **Set Headers**:
   - Key: `Content-Type`
   - Value: `application/json`

3. **Set Body** (raw JSON):
```json
{
  "email": "employee1@test.com",
  "password": "Employee@123"
}
```

4. **Send Request**

5. **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "employee_id": "EMP001",
      "email": "employee1@test.com",
      "role": "employee",
      "email_verified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

6. **Save Token Automatically**:
   - Click **"Tests"** tab (below URL)
   - Add this script:
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.environment.set("token", jsonData.data.token);
       console.log("Token saved:", jsonData.data.token);
   }
   ```
   - Click **"Send"** again
   - Token is now saved in environment variable `{{token}}`

✅ **Token is now saved and will be used automatically!**

---

### 🟢 STEP 4: Get Current User (Test Authentication)

**Purpose**: Verify token works

1. **Create Request**:
   - Name: `4. Get Current User`
   - Method: **GET**
   - URL: `{{base_url}}/auth/me`

2. **Set Authorization**:
   - Go to **"Authorization"** tab
   - Type: **"Bearer Token"**
   - Token: `{{token}}` (automatically filled from environment)

3. **Send Request**

4. **Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "employee_id": "EMP001",
    "email": "employee1@test.com",
    "role": "employee"
  }
}
```

✅ **Authentication is working!**

---

### 🟢 STEP 5: Get Employee Profile

**Purpose**: View employee profile

1. **Create Request**:
   - Name: `5. Get Employee Profile`
   - Method: **GET**
   - URL: `{{base_url}}/employees/{{user_id}}`
   - Replace `{{user_id}}` with the user ID from Step 2

2. **Authorization**: Bearer Token `{{token}}`

3. **Send Request**

4. **Expected Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "user_id": "uuid-here",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "job_title": "Software Engineer",
    "department": "IT",
    "email": "employee1@test.com",
    "employee_id": "EMP001"
  }
}
```

✅ **Profile retrieved successfully!**

---

### 🟢 STEP 6: Update Employee Profile

**Purpose**: Update profile (limited fields for employee)

1. **Create Request**:
   - Name: `6. Update Employee Profile`
   - Method: **PUT**
   - URL: `{{base_url}}/employees/{{user_id}}`

2. **Authorization**: Bearer Token `{{token}}`

3. **Set Body** (raw JSON):
```json
{
  "phone": "+9876543210",
  "address": "123 Main Street, City, Country"
}
```

4. **Send Request**

5. **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid-here",
    "phone": "+9876543210",
    "address": "123 Main Street, City, Country",
    ...
  }
}
```

✅ **Profile updated!**

---

### 🟢 STEP 7: Check In

**Purpose**: Mark attendance check-in

1. **Create Request**:
   - Name: `7. Check In`
   - Method: **POST**
   - URL: `{{base_url}}/attendance/check-in`

2. **Authorization**: Bearer Token `{{token}}`

3. **Set Body** (raw JSON):
```json
{
  "date": "2024-01-20"
}
```
   - Or leave empty `{}` to use today's date

4. **Send Request**

5. **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "id": "uuid-here",
    "user_id": "uuid-here",
    "date": "2024-01-20",
    "check_in_time": "2024-01-20T09:00:00.000Z",
    "status": "half_day"
  }
}
```

✅ **Check-in recorded!**

---

### 🟢 STEP 8: Check Out

**Purpose**: Mark attendance check-out

1. **Create Request**:
   - Name: `8. Check Out`
   - Method: **POST**
   - URL: `{{base_url}}/attendance/check-out`

2. **Authorization**: Bearer Token `{{token}}`

3. **Set Body** (raw JSON):
```json
{
  "date": "2024-01-20"
}
```

4. **Send Request**

5. **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "id": "uuid-here",
    "check_in_time": "2024-01-20T09:00:00.000Z",
    "check_out_time": "2024-01-20T17:00:00.000Z",
    "status": "present"
  }
}
```

✅ **Check-out recorded!**

---

### 🟢 STEP 9: Get My Attendance

**Purpose**: View attendance records

1. **Create Request**:
   - Name: `9. Get My Attendance`
   - Method: **GET**
   - URL: `{{base_url}}/attendance/my-attendance?startDate=2024-01-01&endDate=2024-01-31`

2. **Authorization**: Bearer Token `{{token}}`

3. **Send Request**

4. **Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "date": "2024-01-20",
      "check_in_time": "2024-01-20T09:00:00.000Z",
      "check_out_time": "2024-01-20T17:00:00.000Z",
      "status": "present"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 1,
    "totalPages": 1
  }
}
```

✅ **Attendance records retrieved!**

---

### 🟢 STEP 10: Apply for Leave

**Purpose**: Submit leave request

1. **Create Request**:
   - Name: `10. Apply for Leave`
   - Method: **POST**
   - URL: `{{base_url}}/leaves`

2. **Authorization**: Bearer Token `{{token}}`

3. **Set Body** (raw JSON):
```json
{
  "leave_type": "paid",
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "remarks": "Family vacation"
}
```

4. **Send Request**

5. **Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "Leave request submitted successfully",
  "data": {
    "id": "uuid-here",
    "user_id": "uuid-here",
    "leave_type": "paid",
    "start_date": "2024-02-01",
    "end_date": "2024-02-05",
    "total_days": 5,
    "status": "pending",
    "remarks": "Family vacation"
  }
}
```

✅ **Leave request submitted! Save the leave ID for approval test!**

---

### 🟢 STEP 11: Get My Leaves

**Purpose**: View leave history

1. **Create Request**:
   - Name: `11. Get My Leaves`
   - Method: **GET**
   - URL: `{{base_url}}/leaves/my-leaves`

2. **Authorization**: Bearer Token `{{token}}`

3. **Send Request**

4. **Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "leave_type": "paid",
      "start_date": "2024-02-01",
      "end_date": "2024-02-05",
      "status": "pending",
      ...
    }
  ],
  "pagination": {...}
}
```

✅ **Leave history retrieved!**

---

### 🟢 STEP 12: Sign In as Admin

**Purpose**: Get admin token for approval operations

1. **Create Request**:
   - Name: `12. Sign In - Admin`
   - Method: **POST**
   - URL: `{{base_url}}/auth/signin`

2. **Set Body** (raw JSON):
```json
{
  "email": "admin@dayflow.com",
  "password": "Admin@123"
}
```

3. **Add Test Script** (Tests tab):
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("admin_token", jsonData.data.token);
    console.log("Admin token saved");
}
```

4. **Send Request**

✅ **Admin token saved as `{{admin_token}}`**

---

### 🟢 STEP 13: Approve Leave (Admin Only)

**Purpose**: Approve leave request as admin

1. **Create Request**:
   - Name: `13. Approve Leave (Admin)`
   - Method: **PATCH**
   - URL: `{{base_url}}/leaves/{{leave_id}}/approve`
   - Replace `{{leave_id}}` with leave ID from Step 10

2. **Authorization**: Bearer Token `{{admin_token}}`

3. **Set Body** (raw JSON):
```json
{
  "admin_comment": "Approved. Enjoy your vacation!"
}
```

4. **Send Request**

5. **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Leave request approved",
  "data": {
    "id": "uuid-here",
    "status": "approved",
    "approved_by": "admin-user-id",
    "admin_comment": "Approved. Enjoy your vacation!"
  }
}
```

✅ **Leave approved!**

---

### 🟢 STEP 14: Get My Salary

**Purpose**: View employee salary (read-only)

⚠️ **Note**: If you get a 404 error here, it means no salary has been set yet. Skip to Step 15 first to set the salary, then come back to this step.

1. **Create Request**:
   - Name: `14. Get My Salary`
   - Method: **GET**
   - URL: `{{base_url}}/payroll/my-salary`

2. **Authorization**: Bearer Token `{{token}}`

3. **Send Request**

4. **Expected Response**:
   - **200 OK** (if salary is set):
```json
{
  "success": true,
  "data": {
    "base_salary": 50000,
    "allowances": {
      "housing": 10000,
      "transport": 5000
    },
    "deductions": {
      "tax": 5000,
      "insurance": 2000
    },
    "net_salary": 53000
  }
}
```

✅ **Salary retrieved!**

   - **404 Not Found** (if no salary set yet):
   ```json
   {
     "success": false,
     "error": {
       "message": "Salary structure not found",
       "code": "SALARY_NOT_FOUND"
     }
   }
   ```
   ⚠️ **If you get 404, proceed to Step 15 first to set the salary, then come back here.**

---

### 🟢 STEP 15: Update Salary (Admin Only)

**Purpose**: Set/update employee salary

⚠️ **Important**: Do this step BEFORE Step 14 if you got a 404 error. You need to set the salary first before viewing it.

**Purpose**: Set/update employee salary

1. **Create Request**:
   - Name: `15. Update Salary (Admin)`
   - Method: **PUT**
   - URL: `{{base_url}}/payroll/{{employee_user_id}}`
   - **Get the employee user ID from Step 2 (Sign Up) response** - copy the `id` field
   - Example: `http://localhost:3000/api/payroll/7e4dc14b-45a8-404a-8189-3e5fb6d91fa7`

2. **Authorization**: Bearer Token `{{admin_token}}`

3. **Set Body** (raw JSON):
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
  },
  "effective_from": "2024-02-01"
}
```

4. **Send Request**

5. **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Salary updated successfully",
  "data": {
    "base_salary": 50000,
    "net_salary": 53000,
    ...
  }
}
```

✅ **Salary updated!**

---

### 🟢 STEP 16: Upload Document

**Purpose**: Upload a document

1. **Create Request**:
   - Name: `16. Upload Document`
   - Method: **POST**
   - URL: `{{base_url}}/documents`

2. **Authorization**: Bearer Token `{{token}}`

3. **Set Body**:
   - Select **"form-data"** (not raw)
   - Add field:
     - Key: `document_type` (Text)
     - Value: `resume`
   - Add field:
     - Key: `file` (File)
     - Value: Select a file from your computer

4. **Send Request**

5. **Expected Response** (201 Created):
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "uuid-here",
    "document_type": "resume",
    "file_path": "/uploads/...",
    "file_name": "resume.pdf"
  }
}
```

✅ **Document uploaded!**

---

### 🟢 STEP 17: Get My Documents

**Purpose**: List all documents

1. **Create Request**:
   - Name: `17. Get My Documents`
   - Method: **GET**
   - URL: `{{base_url}}/documents/my-documents`

2. **Authorization**: Bearer Token `{{token}}`

3. **Send Request**

4. **Expected Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "document_type": "resume",
      "file_name": "resume.pdf",
      "uploaded_at": "2024-01-20T..."
    }
  ],
  "pagination": {...}
}
```

✅ **Documents retrieved!**

---

## 🎯 Quick Testing Checklist

- [ ] Health Check
- [ ] Sign Up
- [ ] Sign In (save token)
- [ ] Get Current User
- [ ] Get Profile
- [ ] Update Profile
- [ ] Check In
- [ ] Check Out
- [ ] Get Attendance
- [ ] Apply Leave
- [ ] Get Leaves
- [ ] Sign In as Admin (save admin token)
- [ ] Approve Leave
- [ ] Get Salary
- [ ] Update Salary (Admin)
- [ ] Upload Document
- [ ] Get Documents

## 💡 Pro Tips

1. **Use Collection Variables**: Save common values like `user_id`, `leave_id` in collection variables
2. **Use Pre-request Scripts**: Automatically set dates, generate test data
3. **Save Responses**: Use "Save Response" to create example responses
4. **Test Error Cases**: Try invalid data, expired tokens, etc.
5. **Use Tests Tab**: Automate token saving and response validation

## 🐛 Common Issues

**401 Unauthorized**: Token expired or missing - Sign in again
**403 Forbidden**: Insufficient permissions - Use admin token
**404 Not Found**: Wrong URL or ID - Check the endpoint
**400 Bad Request**: Invalid data - Check request body format
**500 Server Error**: Check server logs

---

**Happy Testing! 🚀**

