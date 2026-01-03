# Dayflow HRMS Frontend

Modern, responsive frontend for the Dayflow Human Resource Management System built with React, Vite, and Tailwind CSS.

## Features

- 🎨 Beautiful, modern UI with professional color scheme
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🔐 JWT-based authentication
- 👥 Role-based access control (Admin, HR, Employee)
- 📊 Interactive dashboards with charts
- ✅ Real-time attendance tracking
- 📅 Leave management with approval workflow
- 💰 Payroll management
- 📄 Document management
- 🎯 Smooth animations and transitions

## Tech Stack

- **React 18+** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Routing
- **TanStack Query (React Query)** - Server state management
- **Axios** - HTTP client
- **React Hook Form + Zod** - Form handling and validation
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI component library
- **Recharts** - Chart library
- **Lucide React** - Icons
- **date-fns** - Date utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional, defaults are set):
```env
VITE_API_URL=http://localhost:3000/api
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # Shadcn UI components
│   │   └── layout/      # Layout components
│   ├── pages/
│   │   ├── Auth/        # Sign in/up pages
│   │   ├── Dashboard/   # Dashboard pages
│   │   ├── Profile/      # Profile page
│   │   ├── Attendance/  # Attendance page
│   │   ├── Leave/        # Leave management
│   │   ├── Payroll/     # Payroll page
│   │   └── Documents/   # Documents page
│   ├── contexts/        # React contexts
│   ├── services/        # API service functions
│   ├── utils/           # Utility functions
│   ├── lib/             # Library utilities
│   └── App.jsx          # Main app component
├── public/              # Static assets
└── package.json
```

## Features Overview

### Authentication
- Sign in with email/password
- Sign up with employee details
- JWT token management
- Auto-redirect based on role

### Employee Dashboard
- Today's attendance status
- Quick check-in/check-out
- Pending leave requests
- Recent activity
- Quick actions

### Admin Dashboard
- Overview statistics
- Interactive charts
- Pending approvals
- Quick actions
- System-wide activity

### Attendance
- Check-in/check-out functionality
- Attendance calendar view
- Attendance history with filters
- Admin view for all employees

### Leave Management
- Apply for leave
- Leave type selection
- Date range picker
- Total days calculator (excludes weekends)
- Admin approval/rejection
- Leave history

### Payroll
- View salary structure
- Allowances and deductions breakdown
- Net salary calculation
- Admin salary management

### Documents
- Upload documents
- Document type categorization
- Grid/list view toggle
- Download and delete functionality

## Color Theme

- **Primary**: Teal/Blue-Green (`#14b8a6`, `#0d9488`)
- **Secondary**: Deep Blue (`#1e40af`)
- **Accent**: Coral/Orange (`#f97316`)
- **Success**: Green (`#10b981`)
- **Warning**: Amber (`#f59e0b`)
- **Error**: Red (`#ef4444`)

## API Integration

All API calls are made to the backend at `http://localhost:3000/api` (configurable via `VITE_API_URL`).

The frontend integrates with all backend endpoints:
- `/auth/*` - Authentication
- `/employees/*` - Employee management
- `/attendance/*` - Attendance tracking
- `/leaves/*` - Leave management
- `/payroll/*` - Payroll management
- `/documents/*` - Document management

## Development

### Adding New Components

1. UI components go in `src/components/ui/`
2. Feature components go in `src/components/`
3. Pages go in `src/pages/`

### Styling

- Use Tailwind CSS utility classes
- Follow the design system colors
- Ensure responsive design (mobile-first)

### State Management

- Use React Query for server state
- Use React Context for global client state
- Use local state for component-specific state

## License

MIT

