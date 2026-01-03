# Dayflow HRMS - Human Resource Management System

<div align="center">

![Dayflow HRMS](https://img.shields.io/badge/Dayflow-HRMS-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.2.3-blue)

**Every workday, perfectly aligned.**

A comprehensive, modern Human Resource Management System built with React, Node.js, and PostgreSQL.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Dayflow HRMS** is a full-stack Human Resource Management System designed to streamline HR operations for modern organizations. It provides a unified platform for managing employees, tracking attendance, processing leave requests, managing payroll, and handling documents—all with a beautiful, intuitive interface.

### Key Highlights

- ✅ **Production Ready** - Fully functional with all core features implemented
- 🔐 **Secure** - JWT authentication, role-based access control, rate limiting
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI** - Sleek black theme with smooth animations
- 📊 **Analytics** - Interactive dashboards with real-time charts and statistics
- 🚀 **Scalable** - Built with modern technologies and best practices

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Secure password hashing with bcrypt
- Role-based access control (Admin, HR, Employee)
- Protected routes and API endpoints
- Session management

### 👥 Employee Management
- Employee profile management
- Employee listing and search (Admin/HR)
- Role-based profile updates
- Employee status tracking (active/inactive)
- Profile picture support

### ⏰ Attendance Tracking
- One-click check-in/check-out
- Automatic status calculation (present/absent/half-day/leave)
- Attendance calendar view
- Daily and weekly attendance reports
- Admin/HR attendance filtering and management

### 📅 Leave Management
- Leave application with date range picker
- Automatic day calculation (excludes weekends)
- Multiple leave types (paid, sick, unpaid)
- Leave approval/rejection workflow (Admin/HR)
- Leave history with filtering
- Automatic attendance updates for approved leaves

### 💰 Payroll Management
- Flexible salary structure
- Allowances and deductions management
- Net salary calculation
- Employee salary view (read-only)
- Admin/HR salary management

### 📄 Document Management
- Document upload with type categorization
- Secure file storage
- Document listing and retrieval
- Grid and list view options
- Document download and deletion
- 10MB file size limit

### 📊 Dashboards
- **Employee Dashboard**: Personal attendance, leave status, quick actions
- **Admin/HR Dashboard**: Organization-wide statistics, interactive charts, pending approvals
- Real-time data visualization with Recharts
- Quick action buttons for common tasks

### 🎨 User Interface
- Modern black theme design
- Fully responsive layout
- Smooth animations and transitions
- Intuitive navigation with sidebar
- Toast notifications for user feedback
- Form validation with helpful error messages

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.3 | UI library |
| **Vite** | 7.2.4 | Build tool and dev server |
| **React Router** | 7.11.0 | Client-side routing |
| **TanStack Query** | 5.90.16 | Server state management |
| **Axios** | 1.13.2 | HTTP client |
| **React Hook Form** | 7.69.0 | Form handling |
| **Zod** | 4.3.4 | Schema validation |
| **Tailwind CSS** | 3.4.19 | Utility-first CSS framework |
| **Shadcn UI** | Latest | UI component library |
| **Recharts** | 2.15.4 | Chart library |
| **Lucide React** | 0.562.0 | Icon library |
| **date-fns** | 4.1.0 | Date utilities |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18.2 | Web framework |
| **PostgreSQL** | Latest | Relational database |
| **JWT (jsonwebtoken)** | 9.0.2 | Authentication tokens |
| **bcrypt** | 5.1.1 | Password hashing |
| **express-validator** | 7.0.1 | Input validation |
| **express-rate-limit** | 7.1.5 | Rate limiting |
| **helmet** | 7.1.0 | Security headers |
| **cors** | 2.8.5 | Cross-origin resource sharing |
| **multer** | 1.4.5-lts.1 | File upload handling |
| **nodemailer** | 6.9.7 | Email service (optional) |
| **uuid** | 9.0.1 | UUID generation |

### Database

- **PostgreSQL** - Primary database
- **UUID** - Primary keys for all tables
- **ENUM types** - For status and role management

---

## 📁 Project Structure

```
HR/
├── Backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── database.js    # PostgreSQL connection
│   │   │   ├── env.js         # Environment variables
│   │   │   └── jwt.js         # JWT configuration
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── employeeController.js
│   │   │   ├── attendanceController.js
│   │   │   ├── leaveController.js
│   │   │   ├── payrollController.js
│   │   │   └── documentController.js
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # JWT authentication
│   │   │   ├── authorize.js   # Role-based authorization
│   │   │   └── errorHandler.js # Error handling
│   │   ├── models/           # Database models
│   │   │   ├── User.js
│   │   │   ├── EmployeeProfile.js
│   │   │   ├── Attendance.js
│   │   │   ├── LeaveRequest.js
│   │   │   ├── SalaryStructure.js
│   │   │   └── Document.js
│   │   ├── routes/           # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── employeeRoutes.js
│   │   │   ├── attendanceRoutes.js
│   │   │   ├── leaveRoutes.js
│   │   │   ├── payrollRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   └── index.js
│   │   ├── services/         # Business logic
│   │   │   ├── authService.js
│   │   │   ├── employeeService.js
│   │   │   ├── attendanceService.js
│   │   │   ├── leaveService.js
│   │   │   ├── payrollService.js
│   │   │   └── documentService.js
│   │   ├── migrations/        # Database migrations
│   │   │   ├── 001_initial_schema.sql
│   │   │   └── 002_add_document_visibility.sql
│   │   ├── seeds/            # Database seeds
│   │   │   └── initialData.js
│   │   ├── utils/            # Utility functions
│   │   │   ├── validators.js
│   │   │   ├── hasher.js
│   │   │   ├── constants.js
│   │   │   └── emailService.js
│   │   └── app.js            # Express app setup
│   ├── uploads/              # Uploaded files storage
│   ├── package.json
│   └── .env                  # Environment variables
│
├── Frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   └── layout/       # Layout components
│   │   ├── pages/            # Page components
│   │   │   ├── Auth/         # Sign in/up pages
│   │   │   ├── Dashboard/    # Dashboard pages
│   │   │   ├── Profile/      # Profile page
│   │   │   ├── Attendance/   # Attendance page
│   │   │   ├── Leave/        # Leave management
│   │   │   ├── Payroll/      # Payroll page
│   │   │   └── Documents/    # Documents page
│   │   ├── contexts/         # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── services/         # API service functions
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── employeeService.js
│   │   │   ├── attendanceService.js
│   │   │   ├── leaveService.js
│   │   │   ├── payrollService.js
│   │   │   └── documentService.js
│   │   ├── utils/            # Utility functions
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json
│   └── vite.config.js
│
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 12+ installed and running
- **Git** for cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KrushnaD7/odoo-hackathon-2026.git
   cd odoo-hackathon-2026
   ```

2. **Backend Setup**

   ```bash
   cd Backend
   npm install
   ```

   Create a `.env` file in the `Backend` directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/dayflow_db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

   Set up the database:
   ```bash
   npm run setup-db
   ```

   (Optional) Seed initial data:
   ```bash
   npm run seed
   ```

   Start the backend server:
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:3000`

3. **Frontend Setup**

   ```bash
   cd Frontend
   npm install
   ```

   Create a `.env` file in the `Frontend` directory (optional):
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

   Start the development server:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

### Default Credentials

**Admin Account:**
- Employee ID: `ADMIN001`
- Email: `admin@dayflow.com`
- Password: `Admin@123`

**Test Employee:**
- Employee ID: `EMP001`
- Email: `employee1@test.com`
- Password: `Employee@123`

⚠️ **Important:** Change default passwords in production!

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | User registration | No |
| POST | `/auth/signin` | User login | No |
| GET | `/auth/me` | Get current user info | Yes |

### Employee Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/employees/:id` | Get employee profile | Yes | Any |
| PUT | `/employees/:id` | Update employee profile | Yes | Any (restricted fields) |
| GET | `/employees` | List all employees | Yes | Admin/HR |

### Attendance Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/attendance/check-in` | Employee check-in | Yes | Employee |
| POST | `/attendance/check-out` | Employee check-out | Yes | Employee |
| GET | `/attendance/my-attendance` | Get own attendance | Yes | Employee |
| GET | `/attendance` | Get all attendance | Yes | Admin/HR |

### Leave Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/leaves` | Apply for leave | Yes | Employee |
| GET | `/leaves/my-leaves` | Get own leave history | Yes | Employee |
| GET | `/leaves` | Get all leave requests | Yes | Admin/HR |
| PATCH | `/leaves/:id/approve` | Approve leave | Yes | Admin/HR |
| PATCH | `/leaves/:id/reject` | Reject leave | Yes | Admin/HR |

### Payroll Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/payroll/my-salary` | Get own salary | Yes | Employee |
| GET | `/payroll` | Get all salaries | Yes | Admin/HR |
| GET | `/payroll/:employeeId` | Get employee salary | Yes | Admin/HR |
| PUT | `/payroll/:employeeId` | Update salary | Yes | Admin/HR |

### Document Endpoints

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/documents` | Upload document | Yes | Any |
| GET | `/documents/my-documents` | Get own documents | Yes | Any |
| GET | `/documents/:id` | Get document | Yes | Any |
| DELETE | `/documents/:id` | Delete document | Yes | Any |

For detailed API documentation, see:
- [Backend README](Backend/README.md)
- [Postman Testing Guide](Backend/POSTMAN_TESTING_GUIDE.md)
- [API Quick Reference](Backend/POSTMAN_QUICK_REFERENCE.md)

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control**: Admin, HR, and Employee roles
- **Protected Routes**: Middleware-based route protection
- **Token Expiration**: Configurable token expiry

### Rate Limiting
- **General API Rate Limit**: 500 requests per 15 minutes per IP
- **Purpose**: Prevents abuse and DDoS attacks
- **Implementation**: `express-rate-limit` middleware
- **Headers**: Standard rate limit headers included in responses

### Input Validation
- **express-validator**: Server-side input validation
- **Zod**: Frontend form validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

### Security Headers
- **Helmet.js**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **Content Security Policy**: XSS protection

### Error Handling
- **Centralized Error Handler**: Consistent error responses
- **Error Logging**: Server-side error logging
- **Production Mode**: Hides sensitive error details in production

### File Upload Security
- **File Size Limit**: 10MB maximum file size
- **File Type Validation**: Document type checking
- **Secure Storage**: Files stored in `uploads/` directory

---

## 📸 Screenshots

### Login Page
- Modern black theme with centered login form
- Clean, professional design

### Dashboard
- **Employee Dashboard**: Personal stats, quick actions, attendance status
- **Admin Dashboard**: Organization-wide analytics, interactive charts, pending approvals

### Features
- Attendance tracking with calendar view
- Leave management with approval workflow
- Payroll management with detailed breakdown
- Document management with grid/list views

---

## 🎯 What We Built

### Backend Implementation
✅ **Complete RESTful API** with 17+ endpoints  
✅ **PostgreSQL Database** with 6 main tables and proper relationships  
✅ **JWT Authentication** system with role-based access control  
✅ **Rate Limiting** (500 requests per 15 minutes)  
✅ **Input Validation** using express-validator  
✅ **Error Handling** middleware with proper error codes  
✅ **File Upload** system with Multer  
✅ **Security Middleware** (Helmet, CORS)  
✅ **Database Migrations** for schema management  
✅ **Seed Scripts** for initial data  

### Frontend Implementation
✅ **React Application** with modern hooks and context API  
✅ **Responsive Design** (mobile, tablet, desktop)  
✅ **Role-Based UI** with different views for Admin/HR/Employee  
✅ **Interactive Dashboards** with Recharts  
✅ **Form Validation** with React Hook Form + Zod  
✅ **State Management** with TanStack Query  
✅ **Modern UI Components** using Shadcn UI  
✅ **Dark Theme** with professional black color scheme  
✅ **Toast Notifications** for user feedback  
✅ **Protected Routes** with authentication checks  

### Key Features Delivered
1. **User Authentication** - Sign up, sign in, JWT token management
2. **Employee Management** - Profile CRUD operations
3. **Attendance System** - Check-in/check-out with automatic status calculation
4. **Leave Management** - Application, approval workflow, history
5. **Payroll System** - Salary structure, allowances, deductions, net calculation
6. **Document Management** - Upload, organize, download, delete
7. **Analytics Dashboard** - Charts, statistics, real-time data
8. **Role-Based Access** - Different permissions for Admin, HR, and Employee

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting
- Update documentation if needed

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **KrushnaD7** - [GitHub](https://github.com/KrushnaD7)

---

## 🙏 Acknowledgments

- Built for **Odoo Hackathon 2026**
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts from [Recharts](https://recharts.org/)

---

## 📞 Support

For support, email support@dayflow.com or open an issue in the repository.

---

<div align="center">

**Made with ❤️ for Odoo Hackathon 2026**

[⬆ Back to Top](#dayflow-hrms---human-resource-management-system)

</div>
