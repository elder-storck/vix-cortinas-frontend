import { NavLink, useNavigate } from 'react-router-dom'
import { FileText, Package, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function Sidebar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = usuario?.nome
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase() ?? ''

  const nav = [
    { icon: FileText, label: 'Orçamentos', to: '/orcamentos' },
    { icon: Package,  label: 'Produtos',   to: '/produtos' },
    ...(usuario?.role === 'admin'
      ? [{ icon: Users, label: 'Usuários', to: '/usuarios' }]
      : []),
  ]

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col bg-[#0f172a]">
      <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-5">
        <img src="/VIX_logo.png" alt="VIX" className="h-8 object-contain" />
        <div>
          <p className="text-sm font-bold leading-tight text-white">VixCortinas</p>
          <p className="text-[11px] text-slate-500">Sistema Comercial</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </p>
        {nav.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-green-900/30 text-green-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0 opacity-80" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-[12px] font-bold text-slate-300">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-200 truncate">{usuario?.nome}</p>
            <p className="text-[11px] text-slate-500 truncate">{usuario?.empresa}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="flex-shrink-0 text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
