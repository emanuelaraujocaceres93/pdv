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

    const { data: venda } = await supabase.from('vendas').insert({ company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8', total: totalCarrinho, payment_method: pagamentoSelecionado }).select().single()
    await supabase.from('movimentacoes_caixa').insert({ tipo: 'venda', valor: totalCarrinho, descricao: 'Venda PDV' })
    for (const item of carrinho) {
      await supabase.from('vendas_itens').insert({ venda_id: venda.id, product_id: item.produto.id, quantity: item.quantidade, price: item.produto.price, total: item.produto.price * item.quantidade })
      await supabase.from('products').update({ stock: item.produto.stock - item.quantidade }).eq('id', item.produto.id)
    }
    alert('💰 Venda finalizada! Total: R$ ' + totalCarrinho.toFixed(2))
    setCarrinho([])
    setModalPagamento(false)
    setPagamentoSelecionado('')
    carregarProdutos()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-800 mb-6">🛒 PDV</h1>
      
      {/* LADO A LADO EM TODAS AS TELAS */}
      <div className="flex flex-row gap-4 md:gap-6">
        
        {/* Produtos - 60% */}
        <div className="w-[60%]">
          <input type="text" placeholder="🔍 Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full border rounded-lg px-2 md:px-4 py-1 md:py-2 text-sm md:text-base mb-3 md:mb-4" />
          <div className="space-y-2 md:space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-1 md:pr-2">
            {produtosFiltrados.map(p => (
              <div key={p.id} className="bg-white rounded-lg shadow p-2 md:p-4 flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs md:text-base truncate">{p.name}</h3>
                  <p className="text-green-600 font-bold text-xs md:text-sm">R$ {p.price.toFixed(2)}</p>
                  <p className="text-[10px] md:text-xs text-gray-500">📦 {p.stock}</p>
                </div>
                <button onClick={() => adicionar(p)} className="bg-amber-700 hover:bg-amber-800 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg text-sm md:text-base ml-2">+</button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Carrinho - 40% - SEMPRE DO LADO DIREITO */}
        <div className="w-[40%] bg-white rounded-lg shadow p-2 md:p-4 sticky top-20 self-start">
          <h2 className="text-sm md:text-xl font-bold mb-2 md:mb-4">🛒 Carrinho ({carrinho.length})</h2>
          {carrinho.length === 0 ? (
            <p className="text-gray-500 text-center py-4 md:py-8 text-xs md:text-base">Vazio</p>
          ) : (
            <div className="space-y-2 md:space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {carrinho.map(i => (
                <div key={i.produto.id} className="border-b pb-2 md:pb-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-xs md:text-sm truncate flex-1">{i.produto.name}</span>
                    <button onClick={() => remover(i.produto.id)} className="text-red-500 text-xs md:text-sm ml-2">✕</button>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs md:text-sm">📦 {i.quantidade}</span>
                    <span className="font-semibold text-xs md:text-sm">R$ {(i.produto.price * i.quantidade).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 md:mt-4 pt-2 md:pt-4 border-t">
            <p className="text-sm md:text-xl font-bold">💰 Total: R$ {totalCarrinho.toFixed(2)}</p>
            <button onClick={finalizarVenda} disabled={carrinho.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white py-1.5 md:py-3 rounded-lg mt-2 md:mt-4 disabled:opacity-50 text-sm md:text-base">
              💳 Finalizar
            </button>
          </div>
        </div>
      </div>

      {modalPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-md">
            <div className="text-center mb-4 md:mb-6">
              <div className="text-3xl md:text-5xl mb-2 md:mb-3">💰</div>
              <h2 className="text-xl md:text-2xl font-bold">Forma de Pagamento</h2>
              <p className="text-gray-500 mt-1 text-sm md:text-base">Total: R$ {totalCarrinho.toFixed(2)}</p>
            </div>
            <div className="space-y-2 md:space-y-3">
              <button onClick={() => setPagamentoSelecionado('dinheiro')} className={'w-full p-2 md:p-4 rounded-xl border-2 text-left flex items-center gap-2 md:gap-3 text-sm md:text-base ' + (pagamentoSelecionado === 'dinheiro' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
                <span className="text-xl md:text-2xl">💵</span><span>Dinheiro</span>{pagamentoSelecionado === 'dinheiro' && <span className="ml-auto text-green-500">✓</span>}
              </button>
              <button onClick={() => setPagamentoSelecionado('cartao_credito')} className={'w-full p-2 md:p-4 rounded-xl border-2 text-left flex items-center gap-2 md:gap-3 text-sm md:text-base ' + (pagamentoSelecionado === 'cartao_credito' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
                <span className="text-xl md:text-2xl">💳</span><span>Cartão Crédito</span>{pagamentoSelecionado === 'cartao_credito' && <span className="ml-auto text-green-500">✓</span>}
              </button>
              <button onClick={() => setPagamentoSelecionado('cartao_debito')} className={'w-full p-2 md:p-4 rounded-xl border-2 text-left flex items-center gap-2 md:gap-3 text-sm md:text-base ' + (pagamentoSelecionado === 'cartao_debito' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
                <span className="text-xl md:text-2xl">💳</span><span>Cartão Débito</span>{pagamentoSelecionado === 'cartao_debito' && <span className="ml-auto text-green-500">✓</span>}
              </button>
              <button onClick={() => setPagamentoSelecionado('pix')} className={'w-full p-2 md:p-4 rounded-xl border-2 text-left flex items-center gap-2 md:gap-3 text-sm md:text-base ' + (pagamentoSelecionado === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>
                <span className="text-xl md:text-2xl">📱</span><span>PIX</span>{pagamentoSelecionado === 'pix' && <span className="ml-auto text-green-500">✓</span>}
              </button>
            </div>
            <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
              <button onClick={confirmarPagamento} disabled={!pagamentoSelecionado} className="flex-1 bg-green-600 text-white py-2 md:py-3 rounded-lg text-sm md:text-base">Confirmar</button>
              <button onClick={() => { setModalPagamento(false); setPagamentoSelecionado('') }} className="flex-1 bg-gray-300 py-2 md:py-3 rounded-lg text-sm md:text-base">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
