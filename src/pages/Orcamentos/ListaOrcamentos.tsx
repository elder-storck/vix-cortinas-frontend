import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/formatters'
import { STATUS_LABELS } from '@/types/orcamento'
import type { StatusOrcamento } from '@/types/orcamento'
import { listarOrcamentos, excluirOrcamento } from '@/lib/api'

const STATUS_PILL: Record<StatusOrcamento, string> = {
  em_aberto: 'border-yellow-300 bg-yellow-50 text-yellow-800',
  enviado:   'border-blue-300 bg-blue-50 text-blue-800',
  aprovado:  'border-green-300 bg-green-50 text-green-800',
  reprovado: 'border-red-300 bg-red-50 text-red-800',
}

type OrcRow = {
  id: number; numero: string; status: StatusOrcamento
  cliente_nome: string | null; instalacao: number; desconto: number
  itens: { m2: Array<{ valorTotal: number }>; ml: Array<{ valorTotal: number }> }
  criado_em: string
}

export function ListaOrcamentos() {
  const [rows, setRows] = useState<OrcRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listarOrcamentos()
      .then(data => setRows(data as OrcRow[]))
      .catch(() => toast.error('Erro ao carregar orçamentos'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: number, numero: string) => {
    if (!confirm(`Remover o orçamento ${numero}?`)) return
    try {
      await excluirOrcamento(id)
      setRows(prev => prev.filter(o => o.id !== id))
      toast.success(`${numero} removido`)
    } catch {
      toast.error('Erro ao remover orçamento')
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-500">
          <span className="font-semibold text-slate-700">Orçamentos</span>
        </nav>
        <Link to="/orcamentos/novo">
          <Button className="bg-green-600 text-sm hover:bg-green-700">
            <Plus className="mr-1.5 h-4 w-4" /> Novo Orçamento
          </Button>
        </Link>
      </header>

      <main className="p-6">
        <div className="mb-5">
          <h1 className="text-[22px] font-bold text-slate-900">Orçamentos</h1>
          <p className="mt-0.5 text-[13px] text-slate-400">
            {loading ? 'Carregando...' : `${rows.length} orçamento${rows.length !== 1 ? 's' : ''} salvo${rows.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {!loading && rows.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-20 text-center">
            <p className="text-sm text-slate-400">Nenhum orçamento salvo ainda.</p>
            <Link to="/orcamentos/novo">
              <Button variant="outline" size="sm" className="mt-4">Criar primeiro orçamento</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <th className="w-36 px-4 py-3 text-left">Número</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="w-28 px-4 py-3 text-left">Status</th>
                  <th className="w-28 px-4 py-3 text-right">Total</th>
                  <th className="w-36 px-4 py-3 text-left">Data</th>
                  <th className="w-20 px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(o => {
                  const subtotal =
                    [...(o.itens?.m2 ?? []), ...(o.itens?.ml ?? [])]
                      .reduce((sum, i) => sum + (i.valorTotal ?? 0), 0)
                  const total = subtotal + (o.instalacao ?? 0) - (o.desconto ?? 0)
                  const date = new Date(o.criado_em).toLocaleDateString('pt-BR')

                  return (
                    <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{o.numero}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {o.cliente_nome ?? <span className="italic text-slate-400">Sem cliente</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_PILL[o.status] ?? ''}`}>
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        {formatCurrency(total)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{date}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1.5">
                          <Button variant="outline" size="icon" className="h-7 w-7" disabled title="Editar — em breve">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline" size="icon"
                            className="h-7 w-7 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(o.id, o.numero)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
