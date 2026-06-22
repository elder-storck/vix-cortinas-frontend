import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Save, FileText, Copy, X } from 'lucide-react'
import { pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useOrcamento } from '@/hooks/useOrcamento'
import { calcularResumo } from '@/hooks/useCalculo'
import { STATUS_LABELS } from '@/types/orcamento'
import type { StatusOrcamento } from '@/types/orcamento'
import { ClienteCard } from '@/components/orcamento/ClienteCard'
import { PainelM2 } from '@/components/orcamento/PainelM2'
import { PainelMetroLinear } from '@/components/orcamento/PainelMetroLinear'
import { TabelaItens } from '@/components/orcamento/TabelaItens'
import { ObservacoesCard } from '@/components/orcamento/ObservacoesCard'
import { ResumoBar } from '@/components/orcamento/ResumoBar'
import { OrcamentoPDF } from '@/components/orcamento/OrcamentoPDF'

const STATUS_PILL: Record<StatusOrcamento, string> = {
  em_aberto: 'border-yellow-300 bg-yellow-50 text-yellow-800',
  enviado:   'border-blue-300 bg-blue-50 text-blue-800',
  aprovado:  'border-green-300 bg-green-50 text-green-800',
  reprovado: 'border-red-300 bg-red-50 text-red-800',
}

export function NovoOrcamento() {
  const { state, dispatch, salvarAgora } = useOrcamento()
  const { subtotal, total } = calcularResumo(state.itensM2, state.itensML, state.instalacao, state.desconto)
  const [gerandoPDF, setGerandoPDF] = useState(false)

  const handleSalvar = async () => {
    if (!state.cliente) {
      toast.error('Selecione um cliente antes de salvar')
      return
    }
    try {
      await salvarAgora()
      toast.success('Orçamento salvo com sucesso')
    } catch {
      toast.error('Erro ao salvar orçamento')
    }
  }

  const handleGerarPDF = async () => {
    if (!state.cliente) {
      toast.error('Selecione um cliente antes de gerar o PDF')
      return
    }
    setGerandoPDF(true)
    try {
      const blob = await pdf(<OrcamentoPDF orcamento={state} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${state.numero ?? 'orcamento'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF gerado com sucesso')
    } catch {
      toast.error('Erro ao gerar PDF')
    } finally {
      setGerandoPDF(false)
    }
  }

  return (
    <>
      {/* Topbar */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-500">
          <Link to="/orcamentos" className="hover:text-slate-700">Orçamentos</Link>
          <span className="text-slate-300">›</span>
          <span className="font-semibold text-slate-700">Novo Orçamento</span>
        </nav>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${STATUS_PILL[state.status]}`}>
            {STATUS_LABELS[state.status]}
          </span>
          <Button variant="outline" size="sm" className="text-xs" onClick={handleSalvar}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> Salvar
          </Button>
          <Button
            size="sm"
            className="bg-green-600 text-xs hover:bg-green-700"
            onClick={handleGerarPDF}
            disabled={gerandoPDF}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            {gerandoPDF ? 'Gerando...' : 'Gerar PDF'}
          </Button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex flex-col gap-4 p-6 pb-28">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900">Novo Orçamento</h1>
            <p className="mt-0.5 text-[13px] text-slate-400">
              {state.numero ? `${state.numero} · ` : ''}Criado hoje
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs text-slate-500" disabled>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplicar
            </Button>
            <Link to="/orcamentos">
              <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600">
                <X className="mr-1.5 h-3.5 w-3.5" /> Cancelar
              </Button>
            </Link>
          </div>
        </div>

        <ClienteCard
          cliente={state.cliente}
          status={state.status}
          onClienteChange={c => dispatch({ type: 'SET_CLIENTE', payload: c })}
          onStatusChange={s => dispatch({ type: 'SET_STATUS', payload: s })}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PainelM2 onAdd={item => dispatch({ type: 'ADD_ITEM_M2', payload: item })} />
          <PainelMetroLinear onAdd={item => dispatch({ type: 'ADD_ITEM_ML', payload: item })} />
        </div>

        <TabelaItens
          itensM2={state.itensM2}
          itensML={state.itensML}
          onRemoveM2={id => { dispatch({ type: 'REMOVE_ITEM_M2', payload: id }); toast.info('Item removido') }}
          onRemoveML={id => { dispatch({ type: 'REMOVE_ITEM_ML', payload: id }); toast.info('Item removido') }}
        />

        <ObservacoesCard
          observacoes={state.observacoes}
          onChange={partial => dispatch({ type: 'SET_OBSERVACOES', payload: partial })}
        />
      </main>

      <ResumoBar
        subtotal={subtotal}
        instalacao={state.instalacao}
        desconto={state.desconto}
        total={total}
        onInstalacaoChange={v => dispatch({ type: 'SET_INSTALACAO', payload: v })}
        onDescontoChange={v => dispatch({ type: 'SET_DESCONTO', payload: v })}
        onSalvar={handleSalvar}
        onGerarPDF={handleGerarPDF}
        gerandoPDF={gerandoPDF}
      />
    </>
  )
}
