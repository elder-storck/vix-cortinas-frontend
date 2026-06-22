export interface Cliente {
  id?: number
  nome: string
  telefone: string
}

export interface ItemM2 {
  id: string
  tipo: string
  tecido: string
  cor: string
  largura: number
  altura: number
  quantidade: number
  valorM2: number
  areaTotal: number
  valorTotal: number
}

export interface ItemML {
  id: string
  tipoTecido: string
  cor: string
  tipoCortina: string
  tipoTecidoBlackout: string
  corBlackout: string
  largura: number
  altura: number
  quantidade: number
  valorMetroLinear: number
  possuiBlackout: boolean
  valorBlackout: number
  consumoTecido: number
  valorTecidoTotal: number
  valorBlackoutTotal: number
  valorTotal: number
}

export interface Observacoes {
  prazo: string
  condicoes_instalacao: string
  geral: string
}

export type StatusOrcamento = 'em_aberto' | 'enviado' | 'aprovado' | 'reprovado'

export const STATUS_LABELS: Record<StatusOrcamento, string> = {
  em_aberto: 'Em aberto',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  reprovado: 'Reprovado',
}

export interface Orcamento {
  id?: number
  numero?: string
  cliente: Cliente | null
  status: StatusOrcamento
  itensM2: ItemM2[]
  itensML: ItemML[]
  instalacao: number
  desconto: number
  observacoes: Observacoes
}
