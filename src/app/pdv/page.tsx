'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Produto {
  id: string
  name: string
  price: number
  stock: number
}

export default function PDVPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<{ produto: Produto; quantidade: number }[]>([])
  const [busca, setBusca] = useState('')
  const [modalPagamento, setModalPagamento] = useState(false)
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState('')

  useEffect(() => { carregarProdutos() }, [])

  async function carregarProdutos() {
    const { data } = await supabase.from('products').select('*').order('name')
    if (data) setProdutos(data)
  }

  const produtosFiltrados = produtos.filter(p => p.name.toLowerCase().includes(busca.toLowerCase()))

  const adicionar = (produto: Produto) => setCarrinho(prev => {
    const existente = prev.find(i => i.produto.id === produto.id)
    if (existente) return prev.map(i => i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i)
    return [...prev, { produto, quantidade: 1 }]
  })

  const remover = (id: string) => setCarrinho(prev => prev.filter(i => i.produto.id !== id))
  const totalCarrinho = carrinho.reduce((sum, i) => sum + i.produto.price * i.quantidade, 0)

  async function finalizarVenda() {
    if (carrinho.length === 0) { alert('Adicione itens ao carrinho!'); return }
    setModalPagamento(true)
  }

  async function confirmarPagamento() {
    if (!pagamentoSelecionado) { alert('Selecione uma forma de pagamento'); return }

    const { data: venda } = await supabase.from('vendas').insert({ 
      company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8', 
      total: totalCarrinho, 
      payment_method: pagamentoSelecionado 
    }).select().single()
    
    await supabase.from('movimentacoes_caixa').insert({ 
      tipo: 'venda', 
      valor: totalCarrinho, 
      descricao: 'Venda PDV' 
    })
    
    for (const item of carrinho) {
      await supabase.from('vendas_itens').insert({ 
        venda_id: venda.id, 
        product_id: item.produto.id, 
        quantity: item.quantidade, 
        price: item.produto.price, 
        total: item.produto.price * item.quantidade 
      })
      await supabase.from('products').update({ 
        stock: item.produto.stock - item.quantidade 
      }).eq('id', item.produto.id)
    }

    alert('Venda finalizada! Total: R$ ' + totalCarrinho.toFixed(2))
    setCarrinho([])
    setModalPagamento(false)
    setPagamentoSelecionado('')
    carregarProdutos()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-800 mb-6">🛒 PDV</h1>
      
      {/* Layout flexível: lado a lado em desktop, empilhado em celular */}
      <div className="flex flex-col lg:flex-row lg:gap-6">
        
        {/* Coluna de Produtos */}
        <div className="flex-1 lg:mr-4 mb-6 lg:mb-0">
          <input 
            type="text" 
            placeholder="🔍 Buscar produto..." 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
            className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-amber-500" 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
            {produtosFiltrados.map(p => (
              <div key={p.id} className="bg-white rounded-lg shadow p-3 flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm md:text-base">{p.name}</h3>
                  <p className="text-green-600 font-bold text-sm">R$ {p.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Estoque: {p.stock}</p>
                </div>
                <button 
                  onClick={() => adicionar(p)} 
                  className="bg-amber-700 hover:bg-amber-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Coluna do Carrinho - sempre visível ao lado em desktop, abaixo em mobile */}
        <div className="w-full lg:w-96 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🛒 Carrinho <span className="text-sm text-gray-500">({carrinho.length} itens)</span></h2>
          
          {carrinho.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Carrinho vazio</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {carrinho.map(i => (
                <div key={i.produto.id} className="border-b pb-3">
                  <div className="flex justify-between items-start">
                    <span className="font-medium flex-1">{i.produto.name}</span>
                    <button onClick={() => remover(i.produto.id)} className="text-red-500 text-sm px-2">✕</button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Qtd: {i.quantidade}</span>
                    </div>
                    <span className="font-semibold text-green-600">R$ {(i.produto.price * i.quantidade).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-green-600">R$ {totalCarrinho.toFixed(2)}</span>
            </div>
            <button 
              onClick={finalizarVenda} 
              disabled={carrinho.length === 0} 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💰 Finalizar Venda
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {modalPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">💰</div>
              <h2 className="text-2xl font-bold">Forma de Pagamento</h2>
              <p className="text-gray-500 mt-1">Total: <span className="font-bold text-green-600 text-xl">R$ {totalCarrinho.toFixed(2)}</span></p>
            </div>
            <div className="space-y-3">
              <button onClick={() => setPagamentoSelecionado('dinheiro')} className={'w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition ' + (pagamentoSelecionado === 'dinheiro' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
                <span className="text-2xl">💵</span><span>Dinheiro</span>{pagamentoSelecionado === 'dinheiro' && <span className="ml-auto text-green-500">✓</span>}
              </button>
              <button onClick={() => setPagamentoSelecionado('cartao_credito')} className={'w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition ' + (pagamentoSelecionado === 'cartao_credito' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
                <span className="text-2xl">💳</span><span>Cartão Crédito</span>{pagamentoSelecionado === 'cartao_credito' && <span className="ml-auto text-green-500">✓</span>}
              </button>
              <button onClick={() => setPagamentoSelecionado('cartao_debito')} className={'w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition ' + (pagamentoSelecionado === 'cartao_debito' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
                <span className="text-2xl">💳</span><span>Cartão Débito</span>{pagamentoSelecionado === 'cartao_debito' && <span className="ml-auto text-green-500">✓</span>}
              </button>
              <button onClick={() => setPagamentoSelecionado('pix')} className={'w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition ' + (pagamentoSelecionado === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
                <span className="text-2xl">📱</span><span>PIX</span>{pagamentoSelecionado === 'pix' && <span className="ml-auto text-green-500">✓</span>}
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={confirmarPagamento} disabled={!pagamentoSelecionado} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition disabled:opacity-50">Confirmar</button>
              <button onClick={() => { setModalPagamento(false); setPagamentoSelecionado('') }} className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-lg transition">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}