'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('senha', senha)
      .single()

    if (error || !data) {
      setErro('Email ou senha incorretos')
      setLoading(false)
      return
    }

    localStorage.setItem('usuario_logado', JSON.stringify({
      id: data.id,
      email: data.email,
      nome: data.nome,
      role: data.role
    }))

    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍷</div>
          <h1 className="text-3xl font-bold text-amber-800">Adega do Juninho</h1>
          <p className="text-gray-500 mt-2">Sistema de PDV</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="admin@adega.com" required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="******" required />
          </div>
          {erro && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{erro}</div>}
          <button type="submit" disabled={loading} className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg transition disabled:opacity-50">{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">juninho@gmail.com / 123456 | admin@adega.com / admin123</p>
        </div>
      </div>
    </div>
  )
}