const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatCurrency = (v: number) => brl.format(v)

export const formatDecimal = (v: number, d = 2) =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(v)

export function parseBRFloat(s: string): number {
  return parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0
}
