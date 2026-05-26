'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function CaixaPage() {
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarVendas() }, [])

  async function carregarVendas() {
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('vendas')
      .select('*')
      .gte('created_at', hoje)
      .order('created_at', { ascending: false })
    
    if (data) setVendas(data)
    setLoading(false)
  }

  const totalVendas = vendas.reduce((sum, v) => sum + v.total, 0)
  const totalDinheiro = vendas.filter(v => v.payment_method === 'dinheiro').reduce((sum, v) => sum + v.total, 0)
  const totalCartaoCredito = vendas.filter(v => v.payment_method === 'cartao_credito').reduce((sum, v) => sum + v.total, 0)
  const totalCartaoDebito = vendas.filter(v => v.payment_method === 'cartao_debito').reduce((sum, v) => sum + v.total, 0)
  const totalPix = vendas.filter(v => v.payment_method === 'pix').reduce((sum, v) => sum + v.total, 0)

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-800 mb-6">💰 Caixa</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Resumo do Dia</h2>
          <div className="space-y-3"><div className="flex justify-between py-2 border-b"><span>Total de Vendas:</span><span className="font-bold text-green-600">R$ {totalVendas.toFixed(2)}</span></div>
          <div className="flex justify-between py-2 border-b"><span>Dinheiro:</span><span className="font-bold">R$ {totalDinheiro.toFixed(2)}</span></div>
          <div className="flex justify-between py-2 border-b"><span>Cartão Crédito:</span><span className="font-bold">R$ {totalCartaoCredito.toFixed(2)}</span></div>
          <div className="flex justify-between py-2 border-b"><span>Cartão Débito:</span><span className="font-bold">R$ {totalCartaoDebito.toFixed(2)}</span></div>
          <div className="flex justify-between py-2 border-b"><span>PIX:</span><span className="font-bold">R$ {totalPix.toFixed(2)}</span></div>
          <div className="flex justify-between py-2 bg-amber-50 px-4 -mx-4 rounded-lg mt-4"><span className="font-bold">Saldo do Dia:</span><span className="font-bold text-green-600">R$ {totalVendas.toFixed(2)}</span></div></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6"><h2 className="text-xl font-bold mb-4">Últimas Vendas</h2><div className="space-y-2">{vendas.slice(0, 5).map(v => (<div key={v.id} className="flex justify-between py-2 border-b"><div><p className="font-medium">R$ {v.total.toFixed(2)}</p><p className="text-xs text-gray-500">{new Date(v.created_at).toLocaleTimeString()}</p></div><span className="px-2 py-1 rounded text-xs bg-gray-100">{v.payment_method}</span></div>))}</div></div>
      </div>
    </div>
  )
}