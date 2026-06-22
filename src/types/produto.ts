export type Categoria = 'ml' | 'm2' | 'blackout'

export interface Produto {
  id: number
  categoria: Categoria
  tipo: string | null
  nome: string
  cor: string | null
  preco: number
  criado_em: string
  atualizado_em: string
}

export interface NovoProduto {
  categoria: Categoria
  tipo?: string
  nome: string
  cor?: string
  preco: number
}
