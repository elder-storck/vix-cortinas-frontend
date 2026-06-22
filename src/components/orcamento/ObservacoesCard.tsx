import { Textarea } from '@/components/ui/textarea'
import type { Observacoes } from '@/types/orcamento'

interface Props {
  observacoes: Observacoes
  onChange: (partial: Partial<Observacoes>) => void
}

export function ObservacoesCard({ observacoes, onChange }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
        <span className="h-3.5 w-0.5 rounded-sm bg-green-600" />
        Observacoes e Condicoes
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          { key: 'prazo' as const,                   label: 'Prazo de entrega',         ph: 'Ex: 15 dias uteis apos aprovacao...' },
          { key: 'condicoes_instalacao' as const,    label: 'Condicoes de instalacao',   ph: 'Ex: Instalacao inclusa no orcamento...' },
          { key: 'geral' as const,                   label: 'Observacoes gerais',         ph: 'Ex: Medicao a confirmar no local...' },
        ].map(({ key, label, ph }) => (
          <div key={key}>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">{label}</label>
            <Textarea
              rows={3}
              className="resize-none text-sm"
              placeholder={ph}
              value={observacoes[key]}
              onChange={e => onChange({ [key]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
