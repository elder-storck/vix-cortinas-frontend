export type RoleUsuario = 'admin' | 'ativo' | 'pendente' | 'rejeitado'

export interface Usuario {
  id: number
  nome: string
  empresa: string
  email: string
  role: RoleUsuario
}
