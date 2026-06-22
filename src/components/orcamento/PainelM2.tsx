import { useState, useEffect } from 'react'
import { Plus, Grid3x3 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { ItemM2 } from '@/types/orcamento'
import type { Produto } from '@/types/produto'
import { calcularItemM2 } from '@/hooks/useCalculo'
import { formatCurrency, formatDecimal } from '@/lib/formatters'
import { listarProdutos } from '@/lib/api'

interface FormState {
  produtoId: string; tipo: string; tecido: string; cor: string
  largura: string; altura: string; quantidade: string; valorM2: string
}

const EMPTY: FormState = {
  produtoId: '', tipo: '', tecido: '', cor: '',
  largura: '', altura: '', quantidade: '1', valorM2: '',
}

interface Props {
  onAdd: (item: Omit<ItemM2, 'id' | 'areaTotal' | 'valorTotal'>) => void
}

export function PainelM2({ onAdd }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    listarProdutos('m2')
      .then(setProdutos)
      .catch(() => toast.error('Erro ao carregar produtos M²'))
  }, [])

  const selecionarProduto = (id: string) => {
    const p = produtos.find(x => String(x.id) === id)
    if (!p) return
    setForm(f => ({
      ...f,
      produtoId: id,
      tipo: p.tipo ?? '',
      tecido: p.nome,
      cor: p.cor ?? '',
      valorM2: String(p.preco),
    }))
  }

  const n = (s: string) => parseFloat(s) || 0
  const largura = n(form.largura)
  const altura  = n(form.altura)
  const qtd     = parseInt(form.quantidade) || 1
  const valorM2 = n(form.valorM2)

  const { areaTotal, valorTotal } = calcularItemM2(largura, altura, qtd, valorM2)

  const adicionar = () => {
    if (!form.tecido || largura <= 0 || altura <= 0 || valorM2 <= 0) {
      toast.error('Selecione um produto e preencha as medidas')
      return
    }
    onAdd({ tipo: form.tipo, tecido: form.tecido, cor: form.cor, largura, altura, quantidade: qtd, valorM2 })
    setForm(EMPTY)
    toast.success('Item adicionado ao orçamento')
  }

  const labelProduto = (p: Produto) =>
    [p.tipo, p.nome, p.cor].filter(Boolean).join(' — ')

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-[13px] font-bold text-slate-700">
        <Grid3x3 className="h-4 w-4 text-green-600" />
        Cortinas por M²
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          Metro Quadrado
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-slate-500">Produto</label>
          <Select value={form.produtoId} onValueChange={selecionarProduto}>
            <SelectTrigger>
              <SelectValue placeholder={produtos.length === 0 ? 'Nenhum produto cadastrado' : 'Selecione um produto...'} />
            </SelectTrigger>
            <SelectContent>
              {produtos.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>{labelProduto(p)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {produtos.length === 0 && (
            <p className="mt-1 text-[11px] text-slate-400">Cadastre produtos em <span className="font-semibold">Produtos → Metro Quadrado</span></p>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Largura (m)</label>
            <Input type="number" min="0" step="0.01" value={form.largura} onChange={e => setForm(f => ({ ...f, largura: e.target.value }))} placeholder="0" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Altura (m)</label>
            <Input type="number" min="0" step="0.01" value={form.altura} onChange={e => setForm(f => ({ ...f, altura: e.target.value }))} placeholder="0" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Qtd</label>
            <Input type="number" min="1" step="1" value={form.quantidade} onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))} placeholder="1" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Valor / m²</label>
            <Input type="number" min="0" step="0.01" value={form.valorM2} onChange={e => setForm(f => ({ ...f, valorM2: e.target.value }))} placeholder="0" />
          </div>
        </div>

        <div className="flex gap-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">Área total</p>
            <p className="text-[15px] font-bold text-green-800">{formatDecimal(areaTotal)} m²</p>
          </div>
          <div className="w-px bg-green-200" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">Valor do item</p>
            <p className="text-[15px] font-bold text-green-800">{formatCurrency(valorTotal)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 p-3">
        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={adicionar}>
          <Plus className="mr-1.5 h-4 w-4" /> Adicionar item M²
        </Button>
      </div>
    </div>
  )
}
