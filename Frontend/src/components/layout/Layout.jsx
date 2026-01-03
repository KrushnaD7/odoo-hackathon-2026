import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to appropriate dashboard based on role
  if (location.pathname === '/') {
    if (user?.role === 'admin' || user?.role === 'hr') {
      navigate('/admin/dashboard', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

