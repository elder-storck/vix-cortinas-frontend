import type { Cliente } from '../types/orcamento'
import type { Categoria, NovoProduto, Produto } from '../types/produto'
import type { Usuario } from '../types/usuario'

const BASE = (import.meta.env.VITE_API_URL ?? '') + '/api'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  })
  if (res.status === 401) {
    localStorage.removeItem('token')
    throw new Error('Sessão expirada')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const buscarClientes = (q: string) =>
  req<Cliente[]>(`/clientes?q=${encodeURIComponent(q)}`)

export const criarCliente = (data: { nome: string; telefone: string }) =>
  req<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(data) })

export const criarOrcamento = (data: unknown) =>
  req<{ id: number; numero: string }>('/orcamentos', { method: 'POST', body: JSON.stringify(data) })

export const atualizarOrcamento = (id: number, data: unknown) =>
  req<void>(`/orcamentos/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

export const listarOrcamentos = () =>
  req<unknown[]>('/orcamentos')

export const buscarOrcamento = (id: number) =>
  req<unknown>(`/orcamentos/${id}`)

export const excluirOrcamento = (id: number) =>
  req<void>(`/orcamentos/${id}`, { method: 'DELETE' })

export const listarProdutos = (categoria?: Categoria) =>
  req<Produto[]>(`/produtos${categoria ? `?categoria=${categoria}` : ''}`)

export const criarProduto = (data: NovoProduto) =>
  req<Produto>('/produtos', { method: 'POST', body: JSON.stringify(data) })

export const atualizarProduto = (id: number, data: Partial<NovoProduto>) =>
  req<Produto>(`/produtos/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

export const excluirProduto = (id: number) =>
  req<void>(`/produtos/${id}`, { method: 'DELETE' })

export const listarUsuarios = () =>
  req<Usuario[]>('/usuarios')

export const atualizarRoleUsuario = (id: number, role: 'ativo' | 'rejeitado') =>
  req<Usuario>(`/usuarios/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) })
