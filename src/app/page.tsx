'use client'

import MenuLayout from '../MenuLayout'

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface Usuario {
  id: string
  email: string
  nome: string
  role: string
}

export default function ComLayout() { return <MenuLayout><Conteudo /></MenuLayout>; } function Conteudo() { return DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    produtos: 0,
    comandasAbertas: 0,
    vendasHoje: 0,
    produtosEstoqueBaixo: 0
  })
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se usuÃ¡rio estÃ¡ logado
    const userLogado = localStorage.getItem('usuario_logado')
    if (!userLogado) {
      router.push('/login')
      return
    }
    
    setUsuario(JSON.parse(userLogado))
    carregarStats()
  }, [])

  async function carregarStats() {
    const { count: produtos } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { count: comandas } = await supabase.from('commands').select('*', { count: 'exact', head: true }).eq('status', 'aberta')
    const hoje = new Date().toISOString().split('T')[0]
    const { data: vendas } = await supabase.from('vendas').select('total').gte('created_at', hoje)
    const vendasHoje = vendas?.reduce((sum, v) => sum + v.total, 0) || 0
    const { data: allProducts } = await supabase.from('products').select('stock, min_stock')
    let estoqueBaixo = 0
    if (allProducts) estoqueBaixo = allProducts.filter(p => p.stock < (p.min_stock || 5)).length

    setStats({ produtos: produtos || 0, comandasAbertas: comandas || 0, vendasHoje, produtosEstoqueBaixo: estoqueBaixo })
    setLoading(false)
  }

  function fazerLogout() {
    localStorage.removeItem('usuario_logado')
    router.push('/login')
  }

  if (loading) return <div className="text-center py-10">Carregando dashboard...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">ðŸ“Š Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">OlÃ¡, {usuario?.nome}!</span>
          <button onClick={fazerLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm">Sair</button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-500">Produtos</p>
          <p className="text-3xl font-bold text-green-600">{stats.produtos}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <p className="text-gray-500">Comandas Abertas</p>
          <p className="text-3xl font-bold text-amber-600">{stats.comandasAbertas}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-500">Vendas Hoje</p>
          <p className="text-3xl font-bold text-blue-600">R$ {stats.vendasHoje.toFixed(2)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-500">Estoque Baixo</p>
          <p className="text-3xl font-bold text-red-600">{stats.produtosEstoqueBaixo}</p>
        </div>
      </div>
    </div>
  )
} }
