'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Venda {
  id: string
  total: number
  payment_method: string
  created_at: string
}

export default function CaixaPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarVendas() }, [])

  async function carregarVendas() {
    const { data } = await supabase.from('vendas').select('*').order('created_at', { ascending: false })
    if (data) setVendas(data)
    setLoading(false)
  }

  const totalVendas = vendas.reduce((sum, v) => sum + v.total, 0)
  const totalDinheiro = vendas.filter(v => v.payment_method === 'dinheiro').reduce((sum, v) => sum + v.total, 0)
  const totalCartao = vendas.filter(v => v.payment_method === 'cartao_credito' || v.payment_method === 'cartao_debito').reduce((sum, v) => sum + v.total, 0)
  const totalPix = vendas.filter(v => v.payment_method === 'pix').reduce((sum, v) => sum + v.total, 0)

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div><h1 className="text-3xl font-bold text-amber-800 mb-6">💰 Caixa</h1>
      <div className="grid lg:grid-cols-2 gap-6"><div className="bg-white rounded-xl shadow-lg p-6"><h2 className="text-xl font-bold mb-4">📊 Resumo do Dia</h2>
        <div className="space-y-3"><div className="flex justify-between py-2 border-b"><span>Total de Vendas:</span><span className="font-bold text-green-600">R$ {totalVendas.toFixed(2)}</span></div>
        <div className="flex justify-between py-2 border-b"><span>Dinheiro:</span><span>R$ {totalDinheiro.toFixed(2)}</span></div>
        <div className="flex justify-between py-2 border-b"><span>Cartão:</span><span>R$ {totalCartao.toFixed(2)}</span></div>
        <div className="flex justify-between py-2 border-b"><span>PIX:</span><span>R$ {totalPix.toFixed(2)}</span></div>
        <div className="flex justify-between py-3 bg-amber-50 rounded-lg px-4"><span className="font-bold">Saldo do Dia:</span><span className="font-bold text-green-600">R$ {totalVendas.toFixed(2)}</span></div></div></div>
        <div className="bg-white rounded-xl shadow-lg p-6"><h2 className="text-xl font-bold mb-4">📋 Últimas Vendas</h2><div className="space-y-2">{vendas.slice(0, 5).map(v => (<div key={v.id} className="p-3 bg-gray-50 rounded-lg"><div className="flex justify-between"><span className="font-bold text-green-600">R$ {v.total.toFixed(2)}</span><span className="text-xs text-gray-500">{new Date(v.created_at).toLocaleString()}</span></div><div className="text-xs text-gray-400 mt-1">Pagamento: {v.payment_method}</div></div>))}</div></div></div></div>
  )
}