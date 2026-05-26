'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    produtos: 0,
    comandasAbertas: 0,
    vendasHoje: 0
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

    setStats({ produtos: produtos || 0, comandasAbertas: comandas || 0, vendasHoje })
    setLoading(false)
  }

  if (loading) return <div className="text-center py-10">Carregando dashboard...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-800 mb-6">📊 Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-6">
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
      </div>
    </div>
  )
}