import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Usuario } from '../types/usuario'

interface AuthContextValue {
  usuario: Usuario | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((u: Usuario) => setUsuario(u))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, senha: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error ?? 'Erro ao fazer login')
    localStorage.setItem('token', body.token)
    setUsuario(body.usuario)
  }

  function logout() {
    const token = localStorage.getItem('token')
    if (token) {
      fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    }
    localStorage.removeItem('token')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
