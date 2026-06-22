import type { ItemM2, ItemML } from '../types/orcamento'

export function calcularItemM2(
  largura: number,
  altura: number,
  quantidade: number,
  valorM2: number
): Pick<ItemM2, 'areaTotal' | 'valorTotal'> {
  const areaTotal = largura * altura
  const valorTotal = areaTotal * quantidade * valorM2
  return { areaTotal, valorTotal }
}

export function calcularItemML(
  largura: number,
  altura: number,
  fatorFranzimento: number,
  quantidade: number,
  valorMetroLinear: number,
  possuiBlackout: boolean,
  valorBlackout: number
): Pick<ItemML, 'consumoTecido' | 'valorTecidoTotal' | 'valorBlackoutTotal' | 'valorTotal'> {
  const consumoTecido = largura * fatorFranzimento * quantidade
  const valorTecidoTotal = consumoTecido * altura * valorMetroLinear
  const valorBlackoutTotal = possuiBlackout ? largura * altura * quantidade * valorBlackout : 0
  const valorTotal = valorTecidoTotal + valorBlackoutTotal
  return { consumoTecido, valorTecidoTotal, valorBlackoutTotal, valorTotal }
}

export function calcularResumo(
  itensM2: ItemM2[],
  itensML: ItemML[],
  instalacao: number,
  desconto: number
): { subtotal: number; total: number } {
  const subtotal =
    itensM2.reduce((a, i) => a + i.valorTotal, 0) +
    itensML.reduce((a, i) => a + i.valorTotal, 0)
  return { subtotal, total: subtotal + instalacao - desconto }
}
