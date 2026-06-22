import { useState, useCallback } from 'react'
import { Search, UserPlus, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { Cliente, StatusOrcamento } from '@/types/orcamento'
import { STATUS_LABELS } from '@/types/orcamento'
import * as api from '@/lib/api'

interface Props {
  cliente: Cliente | null
  status: StatusOrcamento
  onClienteChange: (c: Cliente | null) => void
  onStatusChange: (s: StatusOrcamento) => void
}

export function ClienteCard({ cliente, status, onClienteChange, onStatusChange }: Props) {
  const [query, setQuery] = useState(cliente?.nome ?? '')
  const [sugestoes, setSugestoes] = useState<Cliente[]>([])
  const [showDrop, setShowDrop] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoTel, setNovoTel] = useState('')

  const buscar = useCallback(async (q: string) => {
    setQuery(q)
    onClienteChange(null)
    if (q.length < 2) { setSugestoes([]); return }
    const list = await api.buscarClientes(q).catch(() => [])
    setSugestoes(list)
    setShowDrop(true)
  }, [onClienteChange])

  const selecionar = (c: Cliente) => {
    onClienteChange(c)
    setQuery(c.nome)
    setShowDrop(false)
  }

  const salvarNovo = async () => {
    if (!novoNome.trim()) return
    try {
      const c = await api.criarCliente({ nome: novoNome.trim(), telefone: novoTel })
      selecionar(c)
      setDialogOpen(false)
      setNovoNome('')
      setNovoTel('')
      toast.success('Cliente cadastrado com sucesso')
    } catch {
      toast.error('Erro ao cadastrar cliente')
    }
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
          <span className="h-3.5 w-0.5 rounded-sm bg-green-600" />
          Dados do Cliente
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_140px]">
          <div className="relative">
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Cliente</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-8"
                placeholder="Digite o nome do cliente..."
                value={query}
                onChange={e => buscar(e.target.value)}
                onBlur={() => setTimeout(() => setShowDrop(false), 150)}
              />
              {cliente && (
                <CheckCircle2 className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
              )}
            </div>
            {showDrop && sugestoes.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                {sugestoes.map(c => (
                  <li
                    key={c.id}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-50"
                    onMouseDown={() => selecionar(c)}
                  >
                    <span className="font-medium">{c.nome}</span>
                    {c.telefone && (
                      <span className="ml-2 text-xs text-slate-400">{c.telefone}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Telefone</label>
            <Input value={cliente?.telefone ?? ''} readOnly placeholder="—" />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Status</label>
            <Select value={status} onValueChange={v => onStatusChange(v as StatusOrcamento)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABELS) as StatusOrcamento[]).map(s => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" className="w-full text-xs" onClick={() => setDialogOpen(true)}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Novo cliente
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastrar cliente</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome *</label>
              <Input value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Nome completo" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Telefone</label>
              <Input value={novoTel} onChange={e => setNovoTel(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={salvarNovo}>Salvar cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
