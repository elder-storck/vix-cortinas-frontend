import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { AppShell } from '../layout/AppShell'

export function ProtectedLayout() {
  const { usuario, loading } = useAuth()
  if (loading) return null
  if (!usuario) return <Navigate to="/login" replace />
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth()
  if (usuario?.role !== 'admin') return <Navigate to="/orcamentos" replace />
  return <>{children}</>
}
