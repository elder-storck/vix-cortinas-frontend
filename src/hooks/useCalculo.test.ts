import { describe, it, expect } from 'vitest'
import { calcularItemM2, calcularItemML, calcularResumo } from './useCalculo'

describe('calcularItemM2', () => {
  it('calculates area and value correctly', () => {
    const r = calcularItemM2(2.4, 1.8, 2, 185)
    expect(r.areaTotal).toBeCloseTo(4.32)
    expect(r.valorTotal).toBeCloseTo(1598.4)
  })

  it('returns zero when dimensions are zero', () => {
    const r = calcularItemM2(0, 0, 1, 100)
    expect(r.areaTotal).toBe(0)
    expect(r.valorTotal).toBe(0)
  })

  it('multiplies by quantity', () => {
    const r = calcularItemM2(1, 1, 3, 100)
    expect(r.valorTotal).toBe(300)
  })
})

describe('calcularItemML', () => {
  it('calculates consumption and value without blackout', () => {
    const r = calcularItemML(3, 2.7, 2.5, 3, 48, false, 0)
    expect(r.consumoTecido).toBeCloseTo(22.5)
    expect(r.valorTecidoTotal).toBeCloseTo(2916)
    expect(r.valorBlackoutTotal).toBe(0)
    expect(r.valorTotal).toBeCloseTo(2916)
  })

  it('adds blackout value when checked', () => {
    const r = calcularItemML(2, 2, 2, 1, 50, true, 30)
    expect(r.consumoTecido).toBe(4)
    expect(r.valorTecidoTotal).toBe(400)
    expect(r.valorBlackoutTotal).toBe(120)
    expect(r.valorTotal).toBe(520)
  })

  it('ignores blackout when unchecked even if value filled', () => {
    const r = calcularItemML(2, 2, 2, 1, 50, false, 30)
    expect(r.valorBlackoutTotal).toBe(0)
  })
})

describe('calcularResumo', () => {
  it('sums items and applies instalacao and desconto', () => {
    const m2 = [{ valorTotal: 1000 }] as any
    const ml = [{ valorTotal: 500 }] as any
    const r = calcularResumo(m2, ml, 300, 100)
    expect(r.subtotal).toBe(1500)
    expect(r.total).toBe(1700)
  })
})
