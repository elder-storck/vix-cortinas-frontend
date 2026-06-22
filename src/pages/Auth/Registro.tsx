import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

export function Registro() {
  const [form, setForm] = useState({ nome: '', empresa: '', email: '', senha: '' })
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Erro ao cadastrar')
      setSucesso(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
        <div className="w-full max-w-sm text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-900/40 border border-green-700 mx-auto mb-4">
            <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold mb-2">Cadastro enviado!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Sua solicitação foi recebida. Aguarde a aprovação do administrador para acessar o sistema.
          </p>
          <Link to="/login" className="text-green-400 hover:text-green-300 text-sm font-medium">
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/VIX_logo.png" alt="VIX Cortinas" className="h-16 mb-4 object-contain" />
          <h1 className="text-white text-xl font-bold">Solicitar acesso</h1>
          <p className="text-slate-400 text-sm mt-1">Preencha os dados para criar sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(
            [
              { field: 'nome',    label: 'Nome completo', type: 'text',     placeholder: 'Seu nome' },
              { field: 'empresa', label: 'Empresa',       type: 'text',     placeholder: 'Nome da empresa' },
              { field: 'email',   label: 'E-mail',        type: 'email',    placeholder: 'seu@email.com' },
              { field: 'senha',   label: 'Senha',         type: 'password', placeholder: '••••••••' },
            ] as const
          ).map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
              <input
                type={type}
                required
                value={form[field]}
                onChange={set(field)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          ))}

          {erro && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Enviando...' : 'Solicitar acesso'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Já tem conta?{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
