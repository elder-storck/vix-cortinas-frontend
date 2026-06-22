import { useReducer, useEffect, useRef, useCallback } from 'react'
import type { Orcamento, ItemM2, ItemML, StatusOrcamento, Observacoes } from '../types/orcamento'
import { calcularItemM2, calcularItemML } from './useCalculo'
import * as api from '../lib/api'

const FATOR_CORTINA: Record<string, number> = {
  'Franzida':        2.0,
  'Lisa':            1.0,
  'Prega':           2.5,
  'Wave':            2.0,
  'Varão com ilhos': 1.5,
}

type Action =
  | { type: 'SET_CLIENTE'; payload: Orcamento['cliente'] }
  | { type: 'SET_STATUS'; payload: StatusOrcamento }
  | { type: 'SET_NUMERO'; payload: { id: number; numero: string } }
  | { type: 'ADD_ITEM_M2'; payload: Omit<ItemM2, 'id' | 'areaTotal' | 'valorTotal'> }
  | { type: 'REMOVE_ITEM_M2'; payload: string }
  | { type: 'ADD_ITEM_ML'; payload: Omit<ItemML, 'id' | 'consumoTecido' | 'valorTecidoTotal' | 'valorBlackoutTotal' | 'valorTotal'> }
  | { type: 'REMOVE_ITEM_ML'; payload: string }
  | { type: 'SET_INSTALACAO'; payload: number }
  | { type: 'SET_DESCONTO'; payload: number }
  | { type: 'SET_OBSERVACOES'; payload: Partial<Observacoes> }

const INITIAL: Orcamento = {
  cliente: null,
  status: 'em_aberto',
  itensM2: [],
  itensML: [],
  instalacao: 0,
  desconto: 0,
  observacoes: { prazo: '', condicoes_instalacao: '', geral: '' },
}

function reducer(state: Orcamento, action: Action): Orcamento {
  switch (action.type) {
    case 'SET_CLIENTE':
      return { ...state, cliente: action.payload }
    case 'SET_STATUS':
      return { ...state, status: action.payload }
    case 'SET_NUMERO':
      return { ...state, id: action.payload.id, numero: action.payload.numero }
    case 'ADD_ITEM_M2': {
      const calc = calcularItemM2(
        action.payload.largura, action.payload.altura,
        action.payload.quantidade, action.payload.valorM2
      )
      return {
        ...state,
        itensM2: [...state.itensM2, { ...action.payload, id: crypto.randomUUID(), ...calc }],
      }
    }
    case 'REMOVE_ITEM_M2':
      return { ...state, itensM2: state.itensM2.filter(i => i.id !== action.payload) }
    case 'ADD_ITEM_ML': {
      const fator = FATOR_CORTINA[action.payload.tipoCortina] ?? 2.0
      const calc = calcularItemML(
        action.payload.largura, action.payload.altura,
        fator, action.payload.quantidade,
        action.payload.valorMetroLinear, action.payload.possuiBlackout,
        action.payload.valorBlackout
      )
      return {
        ...state,
        itensML: [...state.itensML, { ...action.payload, id: crypto.randomUUID(), ...calc }],
      }
    }
    case 'REMOVE_ITEM_ML':
      return { ...state, itensML: state.itensML.filter(i => i.id !== action.payload) }
    case 'SET_INSTALACAO':
      return { ...state, instalacao: action.payload }
    case 'SET_DESCONTO':
      return { ...state, desconto: action.payload }
    case 'SET_OBSERVACOES':
      return { ...state, observacoes: { ...state.observacoes, ...action.payload } }
    default:
      return state
  }
}

function toPayload(state: Orcamento) {
  return {
    cliente_id: state.cliente?.id ?? null,
    status: state.status,
    itens: { m2: state.itensM2, ml: state.itensML },
    instalacao: state.instalacao,
    desconto: state.desconto,
    observacoes: state.observacoes,
  }
}

export function useOrcamento() {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const idRef = useRef<number | undefined>(undefined)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    if (!state.cliente) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        if (!idRef.current) {
          const created = await api.criarOrcamento(toPayload(state))
          idRef.current = created.id
          dispatch({ type: 'SET_NUMERO', payload: { id: created.id, numero: created.numero } })
        } else {
          await api.atualizarOrcamento(idRef.current, toPayload(state))
        }
      } catch { /* silent */ }
    }, 2000)
    return () => clearTimeout(timerRef.current)
  }, [state])

  const salvarAgora = useCallback(async () => {
    if (!state.cliente) throw new Error('cliente_obrigatorio')
    clearTimeout(timerRef.current)
    if (!idRef.current) {
      const created = await api.criarOrcamento(toPayload(state))
      idRef.current = created.id
      dispatch({ type: 'SET_NUMERO', payload: { id: created.id, numero: created.numero } })
      return created
    }
    return api.atualizarOrcamento(idRef.current, toPayload(state))
  }, [state])

  return { state, dispatch, salvarAgora }
}
