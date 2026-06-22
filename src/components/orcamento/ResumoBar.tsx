import { Save, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/formatters'

interface Props {
  subtotal: number
  instalacao: number
  desconto: number
  total: number
  onInstalacaoChange: (v: number) => void
  onDescontoChange: (v: number) => void
  onSalvar: () => void
  onGerarPDF?: () => void
  gerandoPDF?: boolean
}

export function ResumoBar({ subtotal, instalacao, desconto, total, onInstalacaoChange, onDescontoChange, onSalvar, onGerarPDF, gerandoPDF }: Props) {
  return (
    <div
      className="fixed bottom-0 right-0 z-20 flex items-center justify-between border-t-2 border-slate-200 bg-white px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      style={{ left: '220px' }}
    >
      <div className="flex items-center gap-7">
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Subtotal</p>
          <p className="text-sm font-bold text-slate-700">{formatCurrency(subtotal)}</p>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-400">Instalacao</p>
          <Input
            type="number" min="0" step="0.01"
            className="h-7 w-28 text-right text-sm"
            value={instalacao || ''}
            onChange={e => onInstalacaoChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-slate-400">Desconto</p>
          <Input
            type="number" min="0" step="0.01"
            className="h-7 w-28 text-right text-sm"
            value={desconto || ''}
            onChange={e => onDescontoChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div className="h-8 w-px bg-slate-200" />
      </div>

      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total final</p>
          <p className="text-[22px] font-extrabold leading-tight text-green-600">{formatCurrency(total)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-xs" onClick={onSalvar}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> Salvar
          </Button>
          <Button className="bg-green-600 px-5 text-sm hover:bg-green-700" onClick={onGerarPDF} disabled={gerandoPDF}>
            <FileText className="mr-1.5 h-4 w-4" /> {gerandoPDF ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </div>
      </div>
    </div>
  )
}
