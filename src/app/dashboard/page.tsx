'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    produtos: 0,
    comandasAbertas: 0,
    vendasHoje: 0,
    produtosEstoqueBaixo: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarStats()
  }, [])

  async function carregarStats() {
    const { count: produtos } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { count: comandas } = await supabase.from('commands').select('*', { count: 'exact', head: true }).eq('status', 'aberta')
    const hoje = new Date().toISOString().split('T')[0]
    const { data: vendas } = await supabase.from('vendas').select('total').gte('created_at', hoje)
    const vendasHoje = vendas?.reduce((sum, v) => sum + v.total, 0) || 0
    const { data: produtosBaixo } = await supabase.from('products').select('id').lt('stock', supabase.rpc('get_min_stock', { row_id: 'id' }))
    
    let estoqueBaixo = 0
    const { data: allProducts } = await supabase.from('products').select('stock, min_stock')
    if (allProducts) estoqueBaixo = allProducts.filter(p => p.stock < p.min_stock).length

    setStats({ produtos: produtos || 0, comandasAbertas: comandas || 0, vendasHoje, produtosEstoqueBaixo: estoqueBaixo })
    setLoading(false)
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-800 mb-6">📊 Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-6">
        <Link href="/produtos" className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition cursor-pointer">
          <p className="text-gray-500">Produtos</p>
          <p className="text-3xl font-bold text-green-600">{stats.produtos}</p>
          <p className="text-sm text-gray-400 mt-2">Clique para ver todos</p>
        </Link>
        
        <Link href="/comandas" className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500 hover:shadow-lg transition cursor-pointer">
          <p className="text-gray-500">Comandas Abertas</p>
          <p className="text-3xl font-bold text-amber-600">{stats.comandasAbertas}</p>
          <p className="text-sm text-gray-400 mt-2">Clique para gerenciar</p>
        </Link>
        
        <Link href="/caixa" className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition cursor-pointer">
          <p className="text-gray-500">Vendas Hoje</p>
          <p className="text-3xl font-bold text-blue-600">R$ {stats.vendasHoje.toFixed(2)}</p>
          <p className="text-sm text-gray-400 mt-2">Clique para ver caixa</p>
        </Link>
        
        <Link href="/produtos?estoque=baixo" className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500 hover:shadow-lg transition cursor-pointer">
          <p className="text-gray-500">Estoque Baixo</p>
          <p className="text-3xl font-bold text-red-600">{stats.produtosEstoqueBaixo}</p>
          <p className="text-sm text-gray-400 mt-2">Clique para reabastecer</p>
        </Link>
      </div>
    </div>
  )
}