'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Venda {
  id: string
  total: number
  payment_method: string
  created_at: string
  status: string
}

interface VendaItem {
  id: string
  product_id: string
  quantity: number
  price: number
  total: number
  products: { name: string }
}

export default function CaixaPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null)
  const [itensVenda, setItensVenda] = useState<VendaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { carregarVendas() }, [])

  async function carregarVendas() {
    const { data } = await supabase
      .from('vendas')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setVendas(data)
    setLoading(false)
  }

  async function carregarItensVenda(vendaId: string) {
    const { data } = await supabase
      .from('vendas_itens')
      .select('*, products(name)')
      .eq('venda_id', vendaId)
    
    if (data) setItensVenda(data as VendaItem[])
  }

  function formatarPagamento(method: string) {
    const methods: Record<string, string> = {
      dinheiro: '💵 Dinheiro',
      cartao_credito: '💳 Cartão Crédito',
      cartao_debito: '💳 Cartão Débito',
      pix: '📱 PIX'
    }
    return methods[method] || method
  }

  const totalVendas = vendas.reduce((sum, v) => sum + v.total, 0)
  const totalDinheiro = vendas.filter(v => v.payment_method === 'dinheiro').reduce((sum, v) => sum + v.total, 0)
  const totalCartaoCredito = vendas.filter(v => v.payment_method === 'cartao_credito').reduce((sum, v) => sum + v.total, 0)
  const totalCartaoDebito = vendas.filter(v => v.payment_method === 'cartao_debito').reduce((sum, v) => sum + v.total, 0)
  const totalPix = vendas.filter(v => v.payment_method === 'pix').reduce((sum, v) => sum + v.total, 0)

  if (loading) return <div className="text-center py-10">Carregando caixa...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-800 mb-6">💰 Caixa</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resumo do Dia */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Resumo do Dia</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total de Vendas:</span>
              <span className="font-bold text-green-600 text-xl">R$ {totalVendas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">💵 Dinheiro:</span>
              <span className="font-medium">R$ {totalDinheiro.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">💳 Cartão Crédito:</span>
              <span className="font-medium">R$ {totalCartaoCredito.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">💳 Cartão Débito:</span>
              <span className="font-medium">R$ {totalCartaoDebito.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">📱 PIX:</span>
              <span className="font-medium">R$ {totalPix.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-amber-50 rounded-lg px-4 -mx-4 mt-3">
              <span className="font-bold text-gray-700">Saldo do Dia:</span>
              <span className="font-bold text-green-600 text-xl">R$ {totalVendas.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Últimas Vendas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Últimas Vendas</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {vendas.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Nenhuma venda registrada</p>
            ) : (
              vendas.map(venda => (
                <div 
                  key={venda.id} 
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition border-l-4 border-amber-500"
                  onClick={() => { setVendaSelecionada(venda); carregarItensVenda(venda.id) }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-green-600">R$ {venda.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{new Date(venda.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">{formatarPagamento(venda.payment_method)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Detalhes da Venda */}
      {vendaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-amber-800">🧾 Detalhes da Venda</h2>
              <button onClick={() => { setVendaSelecionada(null); setItensVenda([]) }} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">&times;</button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">{new Date(vendaSelecionada.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Forma de Pagamento:</span>
                <span className="font-medium">{formatarPagamento(vendaSelecionada.payment_method)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600 font-bold">Total:</span>
                <span className="font-bold text-green-600 text-xl">R$ {vendaSelecionada.total.toFixed(2)}</span>
              </div>
            </div>
            
            <h3 className="font-bold text-lg mb-3 text-gray-700">🛒 Produtos</h3>
            <div className="space-y-2">
              {itensVenda.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.products?.name || 'Produto'}</p>
                    <p className="text-sm text-gray-500">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-green-600">R$ {item.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <button onClick={() => { setVendaSelecionada(null); setItensVenda([]) }} className="w-full mt-6 bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 rounded-lg transition">Fechar</button>
          </div>
        </div>
      )}
    </div>
  )
}