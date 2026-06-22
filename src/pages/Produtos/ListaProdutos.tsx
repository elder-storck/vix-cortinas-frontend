import { useEffect, useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/formatters'
import { listarProdutos, criarProduto, atualizarProduto, excluirProduto } from '@/lib/api'
import type { Produto, NovoProduto, Categoria } from '@/types/produto'

type Tab = 'm2' | 'ml'

const EMPTY_M2: NovoProduto = { categoria: 'm2', tipo: '', nome: '', cor: '', preco: 0 }
const EMPTY_ML: NovoProduto = { categoria: 'ml', nome: '', preco: 0 }
const EMPTY_BO: NovoProduto = { categoria: 'blackout', nome: '', preco: 0 }

function useProducts(categoria: Categoria) {
  const [items, setItems] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listarProdutos(categoria)
      .then(setItems)
      .catch(() => toast.error('Erro ao carregar produtos'))
      .finally(() => setLoading(false))
  }, [categoria])

  const add = async (data: NovoProduto) => {
    const novo = await criarProduto(data)
    setItems(prev => [...prev, novo])
    return novo
  }

  const update = async (id: number, data: Partial<NovoProduto>) => {
    const updated = await atualizarProduto(id, data)
    setItems(prev => prev.map(p => (p.id === id ? updated : p)))
  }

  const remove = async (id: number) => {
    await excluirProduto(id)
    setItems(prev => prev.filter(p => p.id !== id))
  }

  return { items, loading, add, update, remove }
}

// ─── Tabela M² ────────────────────────────────────────────────────────────────

function TabelaM2() {
  const { items, loading, add, update, remove } = useProducts('m2')
  const [form, setForm] = useState(EMPTY_M2)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<Partial<NovoProduto>>({})

  const handleAdd = async () => {
    if (!form.nome) return toast.warning('Informe o tecido/material')
    try {
      await add(form)
      setForm(EMPTY_M2)
      setShowForm(false)
      toast.success('Produto adicionado')
    } catch { toast.error('Erro ao adicionar') }
  }

  const startEdit = (p: Produto) => {
    setEditId(p.id)
    setEditRow({ tipo: p.tipo ?? '', nome: p.nome, cor: p.cor ?? '', preco: p.preco })
  }

  const saveEdit = async () => {
    if (!editId) return
    try {
      await update(editId, editRow)
      setEditId(null)
      toast.success('Produto atualizado')
    } catch { toast.error('Erro ao atualizar') }
  }

  const handleDelete = async (p: Produto) => {
    if (!confirm(`Remover "${p.nome}"?`)) return
    try {
      await remove(p.id)
      toast.success('Produto removido')
    } catch { toast.error('Erro ao remover') }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] text-slate-400">
          {loading ? 'Carregando...' : `${items.length} produto${items.length !== 1 ? 's' : ''} cadastrado${items.length !== 1 ? 's' : ''}`}
        </p>
        {!showForm && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs" onClick={() => setShowForm(true)}>
            + Novo produto M²
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Tecido / Material</th>
              <th className="px-4 py-3 text-left">Cor</th>
              <th className="px-4 py-3 text-right">Preço/m²</th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              editId === p.id ? (
                <tr key={p.id} className="border-b border-slate-100 bg-green-50/30">
                  <td className="px-2 py-2">
                    <Input className="h-7 text-xs" value={editRow.tipo ?? ''} onChange={e => setEditRow(r => ({ ...r, tipo: e.target.value }))} />
                  </td>
                  <td className="px-2 py-2">
                    <Input className="h-7 text-xs" value={editRow.nome ?? ''} onChange={e => setEditRow(r => ({ ...r, nome: e.target.value }))} />
                  </td>
                  <td className="px-2 py-2">
                    <Input className="h-7 text-xs" value={editRow.cor ?? ''} onChange={e => setEditRow(r => ({ ...r, cor: e.target.value }))} />
                  </td>
                  <td className="px-2 py-2">
                    <Input className="h-7 text-xs text-right" type="number" min={0} step={0.01} value={editRow.preco ?? 0} onChange={e => setEditRow(r => ({ ...r, preco: parseFloat(e.target.value) || 0 }))} />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={saveEdit}><Check className="h-3 w-3" /></Button>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setEditId(null)}><X className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700">{p.tipo ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.nome}</td>
                  <td className="px-4 py-3 text-slate-500">{p.cor ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(p.preco)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => startEdit(p)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 hover:border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(p)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {items.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[13px] text-slate-400">Nenhum produto M² cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50/40 p-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-green-700">+ Novo produto M²</p>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tipo</label>
              <Input placeholder="ex: Persiana" value={form.tipo ?? ''} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tecido / Material</label>
              <Input placeholder="ex: Alumínio" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Cor</label>
              <Input placeholder="ex: Branco" value={form.cor ?? ''} onChange={e => setForm(f => ({ ...f, cor: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Preço/m²</label>
              <Input type="number" min={0} step={0.01} placeholder="0,00" value={form.preco || ''} onChange={e => setForm(f => ({ ...f, preco: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleAdd}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY_M2) }}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tabela ML / Blackout (reutilizável) ──────────────────────────────────────

function TabelaSimples({ categoria, titulo, labelPreco }: { categoria: 'ml' | 'blackout'; titulo: string; labelPreco: string }) {
  const { items, loading, add, update, remove } = useProducts(categoria)
  const emptyForm: NovoProduto = categoria === 'ml' ? EMPTY_ML : EMPTY_BO
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<Partial<NovoProduto>>({})

  const handleAdd = async () => {
    if (!form.nome) return toast.warning('Informe o nome do tecido')
    try {
      await add(form)
      setForm(emptyForm)
      setShowForm(false)
      toast.success('Produto adicionado')
    } catch { toast.error('Erro ao adicionar') }
  }

  const startEdit = (p: Produto) => {
    setEditId(p.id)
    setEditRow({ nome: p.nome, preco: p.preco })
  }

  const saveEdit = async () => {
    if (!editId) return
    try {
      await update(editId, editRow)
      setEditId(null)
      toast.success('Produto atualizado')
    } catch { toast.error('Erro ao atualizar') }
  }

  const handleDelete = async (p: Produto) => {
    if (!confirm(`Remover "${p.nome}"?`)) return
    try {
      await remove(p.id)
      toast.success('Produto removido')
    } catch { toast.error('Erro ao remover') }
  }

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-700">{titulo}</h3>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-slate-400">
            {loading ? 'Carregando...' : `${items.length} produto${items.length !== 1 ? 's' : ''}`}
          </span>
          {!showForm && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowForm(true)}>
              + Adicionar
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 text-left">Nome do Tecido</th>
              <th className="px-4 py-3 text-right">{labelPreco}</th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              editId === p.id ? (
                <tr key={p.id} className="border-b border-slate-100 bg-blue-50/30">
                  <td className="px-2 py-2">
                    <Input className="h-7 text-xs" value={editRow.nome ?? ''} onChange={e => setEditRow(r => ({ ...r, nome: e.target.value }))} />
                  </td>
                  <td className="px-2 py-2">
                    <Input className="h-7 text-xs text-right" type="number" min={0} step={0.01} value={editRow.preco ?? 0} onChange={e => setEditRow(r => ({ ...r, preco: parseFloat(e.target.value) || 0 }))} />
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={saveEdit}><Check className="h-3 w-3" /></Button>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setEditId(null)}><X className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-700">{p.nome}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(p.preco)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => startEdit(p)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 hover:border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(p)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {items.length === 0 && !loading && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-[13px] text-slate-400">Nenhum produto cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Nome do Tecido</label>
              <Input placeholder="ex: Voil" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{labelPreco}</label>
              <Input type="number" min={0} step={0.01} placeholder="0,00" value={form.preco || ''} onChange={e => setForm(f => ({ ...f, preco: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleAdd}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setForm(emptyForm) }}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export function ListaProdutos() {
  const [tab, setTab] = useState<Tab>('m2')

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center border-b border-slate-200 bg-white px-6">
        <span className="font-semibold text-slate-700">Produtos</span>
      </header>

      <main className="p-6">
        <div className="mb-5">
          <h1 className="text-[22px] font-bold text-slate-900">Produtos</h1>
          <p className="mt-0.5 text-[13px] text-slate-400">Catálogo de tecidos e materiais usados nos orçamentos</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-0 border-b border-slate-200">
          {([['m2', 'Metro Quadrado'], ['ml', 'Metro Linear & Blackout']] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                tab === key
                  ? 'border-b-2 border-green-600 text-green-700'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'm2' && <TabelaM2 />}
        {tab === 'ml' && (
          <div>
            <TabelaSimples categoria="ml" titulo="Tecidos Metro Linear" labelPreco="Preço/m" />
            <TabelaSimples categoria="blackout" titulo="Blackout" labelPreco="Preço/m²" />
          </div>
        )}
      </main>
    </>
  )
}
