'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    produtos: 0,
    comandasAbertas: 0,
    vendasHoje: 0,
    produtosEstoqueBaixo: 0,
    totalRetiradas: 0,
    lucroTotal: 0,
    totalVendas: 0
  })
  const [usuario, setUsuario] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    const { data: retiradas } = await supabase.from('movimentacoes_caixa').select('valor').eq('tipo', 'retirada').gte('created_at', hoje)
    const totalRetiradas = retiradas?.reduce((sum, r) => sum + r.valor, 0) || 0
    
    // Buscar lucro total
    const { data: lucroData } = await supabase.from('lucro_total').select('*')
    const lucroTotal = lucroData?.[0]?.lucro_total || 0
    const totalVendas = lucroData?.[0]?.total_vendas || 0

    setStats({ 
      produtos: produtos || 0, 
      comandasAbertas: comandas || 0, 
      vendasHoje, 
      produtosEstoqueBaixo: estoqueBaixo,
      totalRetiradas,
      lucroTotal,
      totalVendas
    })
    setLoading(false)
  }

  function fazerLogout() {
    localStorage.removeItem('usuario_logado')
    router.push('/login')
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">📊 Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Olá, {usuario?.nome}!</span>
          <button onClick={fazerLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition text-sm">Sair</button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Link href="/produtos" className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-green-500 hover:shadow-lg">
          <p className="text-gray-500 text-sm">🍷 Produtos</p>
          <p className="text-2xl font-bold text-green-600">{stats.produtos}</p>
        </Link>
        <Link href="/comandas" className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-amber-500 hover:shadow-lg">
          <p className="text-gray-500 text-sm">📋 Comandas Abertas</p>
          <p className="text-2xl font-bold text-amber-600">{stats.comandasAbertas}</p>
        </Link>
        <Link href="/caixa" className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-blue-500 hover:shadow-lg">
          <p className="text-gray-500 text-sm">💰 Vendas Hoje</p>
          <p className="text-2xl font-bold text-blue-600">R$ {stats.vendasHoje.toFixed(2)}</p>
        </Link>
        <Link href="/produtos?estoque=baixo" className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-red-500 hover:shadow-lg">
          <p className="text-gray-500 text-sm">⚠️ Estoque Baixo</p>
          <p className="text-2xl font-bold text-red-600">{stats.produtosEstoqueBaixo}</p>
        </Link>
        <Link href="/caixa" className="bg-white rounded-lg shadow p-4 md:p-6 border-l-4 border-purple-500 hover:shadow-lg">
          <p className="text-gray-500 text-sm">💸 Retiradas Hoje</p>
          <p className="text-2xl font-bold text-purple-600">R$ {stats.totalRetiradas.toFixed(2)}</p>
        </Link>
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow p-4 md:p-6 text-white">
          <p className="text-sm opacity-90">📊 Lucro Total</p>
          <p className="text-2xl font-bold">R$ {stats.lucroTotal.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">Vendas: R$ {stats.totalVendas.toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}
