'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Venda {
  id: string
  total: number
  payment_method: string
  created_at: string
}

interface VendaItem {
  id: string
  product_id: string
  quantity: number
  price: number
  total: number
  products: { name: string }
}

interface Movimentacao {
  id: string
  tipo: string
  valor: number
  descricao: string
  created_at: string
}

export default function CaixaPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [retiradas, setRetiradas] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [modalRetirada, setModalRetirada] = useState(false)
  const [modalDetalhes, setModalDetalhes] = useState<Venda | null>(null)
  const [itensVenda, setItensVenda] = useState<VendaItem[]>([])
  const [valorRetirada, setValorRetirada] = useState('')
  const [descricaoRetirada, setDescricaoRetirada] = useState('')

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    try {
      // Carregar vendas
      const { data: vendasData } = await supabase
        .from('vendas')
        .select('*')
        .order('created_at', { ascending: false })
      if (vendasData) setVendas(vendasData)
      
      // Carregar apenas retiradas
      const { data: movData } = await supabase
        .from('movimentacoes_caixa')
        .select('*')
        .eq('tipo', 'retirada')
        .order('created_at', { ascending: false })
      if (movData) setRetiradas(movData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setLoading(false)
  }

  async function carregarItensVenda(vendaId: string) {
    const { data } = await supabase
      .from('vendas_itens')
      .select('*, products(name)')
      .eq('venda_id', vendaId)
    if (data) setItensVenda(data as VendaItem[])
  }

  async function fazerRetirada() {
    const valor = parseFloat(valorRetirada)
    if (isNaN(valor) || valor <= 0) {
      alert('Digite um valor vÃ¡lido')
      return
    }

    try {
      const { error } = await supabase.from('movimentacoes_caixa').insert({
        tipo: 'retirada',
        valor: valor,
        descricao: descricaoRetirada || 'Retirada de caixa'
      })

      if (error) {
        alert('Erro ao registrar retirada: ' + error.message)
        return
      }

      alert('âœ… Retirada registrada com sucesso!')
      setModalRetirada(false)
      setValorRetirada('')
      setDescricaoRetirada('')
      carregarDados()
    } catch (error) {
      alert('Erro ao registrar retirada')
    }
  }

  async function excluirVenda(id: string) {
    if (confirm('Tem certeza que deseja excluir esta venda?')) {
      await supabase.from('vendas').delete().eq('id', id)
      await supabase.from('vendas_itens').delete().eq('venda_id', id)
      carregarDados()
      setModalDetalhes(null)
      alert('Venda excluÃ­da com sucesso!')
    }
  }

  const totalVendas = vendas.reduce((sum, v) => sum + v.total, 0)
  const totalRetiradas = retiradas.reduce((sum, r) => sum + r.valor, 0)
  const saldoAtual = totalVendas - totalRetiradas

  function formatarPagamento(method: string) {
    const methods: Record<string, string> = {
      dinheiro: 'ðŸ’µ Dinheiro',
      cartao_credito: 'ðŸ’³ CartÃ£o CrÃ©dito',
      cartao_debito: 'ðŸ’³ CartÃ£o DÃ©bito',
      pix: 'ðŸ“± PIX'
    }
    return methods[method] || method
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-amber-800 mb-6">ðŸ’° Caixa</h1>
      
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Resumo do Caixa */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">ðŸ“Š Resumo do Caixa</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span>Total de Vendas:</span>
              <span className="font-bold text-green-600">R$ {totalVendas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Total de Retiradas:</span>
              <span className="font-bold text-red-600">R$ {totalRetiradas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 bg-amber-50 rounded-lg px-4 -mx-4">
              <span className="font-bold">Saldo Atual:</span>
              <span className="font-bold text-green-600 text-xl">R$ {saldoAtual.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={() => setModalRetirada(true)} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition">
            ðŸ’° Retirar Dinheiro
          </button>
        </div>
        
        {/* Ãšltimas Retiradas */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">ðŸ’¸ Ãšltimas Retiradas</h2>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {retiradas.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhuma retirada registrada</p>
            ) : (
              retiradas.slice(0, 10).map(r => (
                <div key={r.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-red-600 font-bold">ðŸ’¸ Retirada</span>
                    <span className="text-red-600 font-bold">R$ {r.valor.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(r.created_at).toLocaleString()} - {r.descricao}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Ãšltimas Vendas - COM CLIQUE PARA DETALHES */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">ðŸ“‹ Ãšltimas Vendas</h2>
        <div className="space-y-2 max-h-100 overflow-y-auto">
          {vendas.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhuma venda registrada</p>
          ) : (
            vendas.slice(0, 10).map(v => (
              <div 
                key={v.id} 
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                onClick={() => { setModalDetalhes(v); carregarItensVenda(v.id) }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-green-600 text-lg">R$ {v.total.toFixed(2)}</span>
                    <div className="text-xs text-gray-500 mt-1">{new Date(v.created_at).toLocaleString()}</div>
                  </div>
                  <span className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">
                    {formatarPagamento(v.payment_method)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Retirada */}
      {modalRetirada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-amber-800 mb-4">ðŸ’° Retirar Dinheiro</h2>
            <input type="number" placeholder="Valor" value={valorRetirada} onChange={e => setValorRetirada(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-3" />
            <input type="text" placeholder="DescriÃ§Ã£o (opcional)" value={descricaoRetirada} onChange={e => setDescricaoRetirada(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-4" />
            <div className="flex gap-3">
              <button onClick={fazerRetirada} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Confirmar</button>
              <button onClick={() => setModalRetirada(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Venda - FUNCIONAL */}
      {modalDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-amber-800">ðŸ§¾ Detalhes da Venda</h2>
              <button onClick={() => setModalDetalhes(null)} className="text-gray-500 text-3xl">&times;</button>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2"><span className="text-gray-600">Data:</span><span>{new Date(modalDetalhes.created_at).toLocaleString()}</span></div>
              <div className="flex justify-between mb-2"><span className="text-gray-600">Pagamento:</span><span>{formatarPagamento(modalDetalhes.payment_method)}</span></div>
              <div className="flex justify-between pt-2 border-t"><span className="font-bold">Total:</span><span className="font-bold text-green-600 text-xl">R$ {modalDetalhes.total.toFixed(2)}</span></div>
            </div>
            <h3 className="font-bold text-lg mb-3">ðŸ›’ Produtos Vendidos</h3>
            <div className="space-y-2 mb-4">
              {itensVenda.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.products?.name || 'Produto'}</p>
                    <p className="text-sm text-gray-500">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-green-600">R$ {item.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => excluirVenda(modalDetalhes.id)} className="flex-1 bg-red-600 text-white py-2 rounded-lg">ðŸ—‘ï¸ Excluir Venda</button>
              <button onClick={() => setModalDetalhes(null)} className="flex-1 bg-gray-300 py-2 rounded-lg">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
