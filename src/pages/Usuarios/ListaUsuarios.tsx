import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { listarUsuarios, atualizarRoleUsuario } from '../../lib/api'
import type { Usuario } from '../../types/usuario'

export function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)

  async function carregar() {
    try {
      const data = await listarUsuarios()
      setUsuarios(data)
    } catch {
      toast.error('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function atualizar(id: number, role: 'ativo' | 'rejeitado') {
    try {
      const updated = await atualizarRoleUsuario(id, role)
      setUsuarios(us => us.map(u => u.id === id ? updated : u))
      toast.success(role === 'ativo' ? 'Usuário aprovado' : 'Usuário rejeitado')
    } catch {
      toast.error('Erro ao atualizar usuário')
    }
  }

  const pendentes = usuarios.filter(u => u.role === 'pendente')
  const ativos = usuarios.filter(u => u.role === 'ativo')
  const rejeitados = usuarios.filter(u => u.role === 'rejeitado')

  if (loading) {
    return (
      <div className="p-8 text-slate-500 text-sm">Carregando...</div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Usuários</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie acessos ao sistema</p>
      </div>

      <Section
        titulo="Aguardando aprovação"
        badge={pendentes.length}
        badgeColor="bg-amber-100 text-amber-700"
        vazio="Nenhum usuário pendente"
      >
        {pendentes.map(u => (
          <UsuarioRow key={u.id} u={u}>
            <button
              onClick={() => atualizar(u.id, 'ativo')}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 transition-colors"
            >
              Aprovar
            </button>
            <button
              onClick={() => atualizar(u.id, 'rejeitado')}
              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              Rejeitar
            </button>
          </UsuarioRow>
        ))}
      </Section>

      <Section
        titulo="Usuários ativos"
        badge={ativos.length}
        badgeColor="bg-green-100 text-green-700"
        vazio="Nenhum usuário ativo"
      >
        {ativos.map(u => (
          <UsuarioRow key={u.id} u={u}>
            <button
              onClick={() => atualizar(u.id, 'rejeitado')}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Revogar
            </button>
          </UsuarioRow>
        ))}
      </Section>

      {rejeitados.length > 0 && (
        <Section
          titulo="Rejeitados"
          badge={rejeitados.length}
          badgeColor="bg-red-100 text-red-700"
          vazio=""
        >
          {rejeitados.map(u => (
            <UsuarioRow key={u.id} u={u}>
              <button
                onClick={() => atualizar(u.id, 'ativo')}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Reativar
              </button>
            </UsuarioRow>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({
  titulo, badge, badgeColor, vazio, children,
}: {
  titulo: string
  badge: number
  badgeColor: string
  vazio: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-slate-700">{titulo}</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeColor}`}>{badge}</span>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {badge === 0
          ? <p className="text-sm text-slate-400 px-4 py-4">{vazio}</p>
          : children}
      </div>
    </div>
  )
}

function UsuarioRow({ u, children }: { u: Usuario; children: React.ReactNode }) {
  const initials = u.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{u.nome}</p>
        <p className="text-xs text-slate-500 truncate">{u.empresa} · {u.email}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {children}
      </div>
    </div>
  )
}
