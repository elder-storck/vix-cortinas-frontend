import { useState, useEffect } from 'react'
import { Plus, MoveRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { ItemML } from '@/types/orcamento'
import type { Produto } from '@/types/produto'
import { calcularItemML } from '@/hooks/useCalculo'
import { formatCurrency, formatDecimal } from '@/lib/formatters'
import { listarProdutos } from '@/lib/api'

const TIPOS_CORTINA = ['Franzida', 'Lisa', 'Prega', 'Wave', 'Varão com ilhos']
const FATOR_CORTINA: Record<string, number> = {
  'Franzida':        2.0,
  'Lisa':            1.0,
  'Prega':           2.5,
  'Wave':            2.0,
  'Varão com ilhos': 1.5,
}

interface FormState {
  tipoTecido: string; cor: string; valorMetroLinear: string
  tipoCortina: string
  largura: string; altura: string; quantidade: string
  possuiBlackout: boolean
  tipoTecidoBlackout: string; corBlackout: string; valorBlackout: string
}

const EMPTY: FormState = {
  tipoTecido: '', cor: '', valorMetroLinear: '',
  tipoCortina: '',
  largura: '', altura: '', quantidade: '1',
  possuiBlackout: false,
  tipoTecidoBlackout: '', corBlackout: '', valorBlackout: '',
}

interface Props {
  onAdd: (item: Omit<ItemML, 'id' | 'consumoTecido' | 'valorTecidoTotal' | 'valorBlackoutTotal' | 'valorTotal'>) => void
}

export function PainelMetroLinear({ onAdd }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [tecidosML, setTecidosML] = useState<Produto[]>([])
  const [tecidosBlackout, setTecidosBlackout] = useState<Produto[]>([])

  useEffect(() => {
    listarProdutos('ml').then(setTecidosML).catch(() => toast.error('Erro ao carregar tecidos ML'))
    listarProdutos('blackout').then(setTecidosBlackout).catch(() => toast.error('Erro ao carregar blackouts'))
  }, [])

  const selecionarTecido = (id: string) => {
    const p = tecidosML.find(x => String(x.id) === id)
    if (!p) return
    setForm(f => ({ ...f, tipoTecido: p.nome, valorMetroLinear: String(p.preco) }))
  }

  const selecionarBlackout = (id: string) => {
    const p = tecidosBlackout.find(x => String(x.id) === id)
    if (!p) return
    setForm(f => ({ ...f, tipoTecidoBlackout: p.nome, valorBlackout: String(p.preco) }))
  }

  const setStr = (k: keyof FormState) => (v: string) => setForm(p => ({ ...p, [k]: v }))

  const n = (s: string) => parseFloat(s) || 0
  const largura = n(form.largura)
  const altura  = n(form.altura)
  const fator   = FATOR_CORTINA[form.tipoCortina] ?? 2.0
  const qtd     = parseInt(form.quantidade) || 1
  const valorML = n(form.valorMetroLinear)
  const valorBK = n(form.valorBlackout)

  const calc = calcularItemML(largura, altura, fator, qtd, valorML, form.possuiBlackout, valorBK)

  const adicionar = () => {
    if (!form.tipoTecido || !form.tipoCortina || largura <= 0 || altura <= 0 || valorML <= 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    onAdd({
      tipoTecido: form.tipoTecido, cor: form.cor,
      tipoCortina: form.tipoCortina,
      tipoTecidoBlackout: form.tipoTecidoBlackout,
      corBlackout: form.corBlackout,
      largura, altura, quantidade: qtd,
      valorMetroLinear: valorML, possuiBlackout: form.possuiBlackout, valorBlackout: valorBK,
    })
    setForm(EMPTY)
    toast.success('Item adicionado ao orçamento')
  }

  const tecidoSelecionadoId = tecidosML.find(p => p.nome === form.tipoTecido)
  const blackoutSelecionadoId = tecidosBlackout.find(p => p.nome === form.tipoTecidoBlackout)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-[13px] font-bold text-slate-700">
        <MoveRight className="h-4 w-4 text-blue-600" />
        Cortinas por Metro Linear
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
          Metro Linear
        </span>
      </div>

      <div className="space-y-3 p-4">
        {/* Tecido principal */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Tecido</label>
            <Select
              value={tecidoSelecionadoId ? String(tecidoSelecionadoId.id) : ''}
              onValueChange={selecionarTecido}
            >
              <SelectTrigger>
                <SelectValue placeholder={tecidosML.length === 0 ? 'Nenhum cadastrado' : 'Selecione...'} />
              </SelectTrigger>
              <SelectContent>
                {tecidosML.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            {tecidosML.length === 0 && (
              <p className="mt-1 text-[10px] text-slate-400">Cadastre em Produtos → Metro Linear</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Cor</label>
            <Input value={form.cor} onChange={e => setStr('cor')(e.target.value)} placeholder="Ex: Branco Gelo" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Preço / metro</label>
            <Input type="number" min="0" step="0.01" value={form.valorMetroLinear} onChange={e => setStr('valorMetroLinear')(e.target.value)} placeholder="0.00" />
          </div>
        </div>

        {/* Tipo de cortina */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Tipo de cortina</label>
            <Select value={form.tipoCortina} onValueChange={setStr('tipoCortina')}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {TIPOS_CORTINA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            {form.tipoCortina && (
              <p className="mb-2 text-[12px] text-slate-500">
                Fator: <span className="font-semibold text-slate-700">{fator.toFixed(1)}×</span>
              </p>
            )}
          </div>
        </div>

        {/* Medidas */}
        <div className="grid grid-cols-3 gap-2">
          {(['largura', 'altura', 'quantidade'] as const).map(k => (
            <div key={k}>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                {k === 'largura' ? 'Largura janela (m)' : k === 'altura' ? 'Altura (m)' : 'Quantidade'}
              </label>
              <Input type="number" min="0" step="0.01" value={form[k]} onChange={e => setStr(k)(e.target.value)} placeholder="0" />
            </div>
          ))}
        </div>

        {/* Blackout */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="blackout"
              checked={form.possuiBlackout}
              onCheckedChange={v => setForm(p => ({ ...p, possuiBlackout: Boolean(v) }))}
            />
            <label htmlFor="blackout" className="cursor-pointer text-[12px] font-medium text-slate-600">
              Possui blackout
            </label>
          </div>
          {form.possuiBlackout && (
            <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500">Tecido blackout</label>
                <Select
                  value={blackoutSelecionadoId ? String(blackoutSelecionadoId.id) : ''}
                  onValueChange={selecionarBlackout}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tecidosBlackout.length === 0 ? 'Nenhum cadastrado' : 'Selecione...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {tecidosBlackout.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                {tecidosBlackout.length === 0 && (
                  <p className="mt-1 text-[10px] text-slate-400">Cadastre em Produtos → Blackout</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500">Cor blackout</label>
                <Input value={form.corBlackout} onChange={e => setStr('corBlackout')(e.target.value)} placeholder="Ex: Branco" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-slate-500">Preço blackout/m²</label>
                <Input type="number" min="0" step="0.01" value={form.valorBlackout} onChange={e => setStr('valorBlackout')(e.target.value)} placeholder="0.00" />
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="flex flex-wrap gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
          {[
            { label: 'Consumo de tecido', val: `${formatDecimal(calc.consumoTecido)} m` },
            { label: 'Valor tecido',      val: formatCurrency(calc.valorTecidoTotal) },
            { label: 'Valor blackout',    val: formatCurrency(calc.valorBlackoutTotal) },
            { label: 'Total item',        val: formatCurrency(calc.valorTotal), bold: true },
          ].map(({ label, val, bold }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">{label}</p>
              <p className={`text-[14px] font-bold ${bold ? 'text-violet-800' : 'text-blue-800'}`}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 p-3">
        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={adicionar}>
          <Plus className="mr-1.5 h-4 w-4" /> Adicionar item Metro Linear
        </Button>
      </div>
    </div>
  )
}
