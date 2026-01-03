import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import SignIn from './pages/Auth/SignIn'
import SignUp from './pages/Auth/SignUp'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard'
import AdminDashboard from './pages/Dashboard/AdminDashboard'
import Profile from './pages/Profile/Profile'
import Attendance from './pages/Attendance/Attendance'
import LeaveList from './pages/Leave/LeaveList'
import ApplyLeave from './pages/Leave/ApplyLeave'
import Payroll from './pages/Payroll/Payroll'
import Documents from './pages/Documents/Documents'
import EmployeeList from './pages/Employees/EmployeeList'

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<LeaveList />} />
          <Route path="leaves/apply" element={<ApplyLeave />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="documents" element={<Documents />} />
          <Route path="" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App

