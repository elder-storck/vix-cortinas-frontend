import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedLayout, AdminRoute } from './components/auth/ProtectedRoute'
import { Login } from './pages/Auth/Login'
import { Registro } from './pages/Auth/Registro'
import { ListaOrcamentos } from './pages/Orcamentos/ListaOrcamentos'
import { NovoOrcamento } from './pages/Orcamentos/NovoOrcamento'
import { ListaProdutos } from './pages/Produtos/ListaProdutos'
import { ListaUsuarios } from './pages/Usuarios/ListaUsuarios'
import { Toaster } from './components/ui/sonner'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Navigate to="/orcamentos" replace />} />
            <Route path="/orcamentos" element={<ListaOrcamentos />} />
            <Route path="/orcamentos/novo" element={<NovoOrcamento />} />
            <Route path="/orcamentos/:id" element={<NovoOrcamento />} />
            <Route path="/produtos" element={<ListaProdutos />} />
            <Route path="/usuarios" element={<AdminRoute><ListaUsuarios /></AdminRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
