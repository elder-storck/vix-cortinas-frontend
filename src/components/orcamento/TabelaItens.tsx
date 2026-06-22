import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ItemM2, ItemML } from '@/types/orcamento'
import { formatCurrency, formatDecimal } from '@/lib/formatters'

type Row = { kind: 'm2'; item: ItemM2 } | { kind: 'ml'; item: ItemML }

interface Props {
  itensM2: ItemM2[]
  itensML: ItemML[]
  onRemoveM2: (id: string) => void
  onRemoveML: (id: string) => void
}

export function TabelaItens({ itensM2, itensML, onRemoveM2, onRemoveML }: Props) {
  const rows: Row[] = [
    ...itensM2.map(item => ({ kind: 'm2' as const, item })),
    ...itensML.map(item => ({ kind: 'ml' as const, item })),
  ]

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <span className="h-3.5 w-0.5 rounded-sm bg-green-600" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Itens do Orcamento
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold normal-case text-slate-500">
            {rows.length} {rows.length === 1 ? 'item' : 'itens'}
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Nenhum item adicionado ainda. Use os paineis acima para adicionar.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                <th className="w-16 px-4 py-2.5 text-left">Tipo</th>
                <th className="px-4 py-2.5 text-left">Produto / Descricao</th>
                <th className="w-32 px-4 py-2.5 text-left">Medidas</th>
                <th className="w-16 px-4 py-2.5 text-center">Qtd</th>
                <th className="w-28 px-4 py-2.5 text-right">Valor unit.</th>
                <th className="w-28 px-4 py-2.5 text-right">Total</th>
                <th className="w-20 px-4 py-2.5 text-center">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <Badge variant="outline"
                      className={row.kind === 'm2'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-blue-200 bg-blue-50 text-blue-700'}>
                      {row.kind === 'm2' ? 'M2' : 'ML'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {row.kind === 'm2' ? (
                      <>
                        <p className="font-semibold text-slate-800">{row.item.tipo} — {row.item.tecido}</p>
                        <p className="text-xs text-slate-400">
                          {row.item.cor && <span>{row.item.cor} · </span>}
                          {formatDecimal(row.item.areaTotal)} m² total
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-800">{row.item.tipoTecido} — {row.item.cor}</p>
                        <p className="text-xs text-slate-400">
                          {row.item.tipoCortina} · Consumo: {formatDecimal(row.item.consumoTecido)} m
                          {row.item.possuiBlackout && ` · Blackout: ${row.item.tipoTecidoBlackout}${row.item.corBlackout ? ` (${row.item.corBlackout})` : ''}`}
                        </p>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDecimal(row.item.largura)} x {formatDecimal(row.item.altura)} m
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{row.item.quantidade}</td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {row.kind === 'm2'
                      ? `${formatCurrency(row.item.valorM2)}/m2`
                      : `${formatCurrency(row.item.valorMetroLinear)}/m`}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    {formatCurrency(row.item.valorTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" className="h-7 w-7" disabled>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar item</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline" size="icon"
                            className="h-7 w-7 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => row.kind === 'm2' ? onRemoveM2(row.item.id) : onRemoveML(row.item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remover item</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </TooltipProvider>
  )
}
