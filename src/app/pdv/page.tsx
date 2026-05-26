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
    
    for (const item of carrinho) {
      await supabase.from('vendas_itens').insert({ venda_id: venda.id, product_id: item.produto.id, quantity: item.quantidade, price: item.produto.price, total: item.produto.price * item.quantidade })
      await supabase.from('products').update({ stock: item.produto.stock - item.quantidade }).eq('id', item.produto.id)
    }

    alert('Venda finalizada! Total: R$ ' + totalCarrinho.toFixed(2))
    setCarrinho([])
    setModalPagamento(false)
    setPagamentoSelecionado('')
    carregarProdutos()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2"><h1 className="text-3xl font-bold text-amber-800 mb-6">🛒 PDV</h1><input type="text" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-4" /><div className="grid gap-4">{produtosFiltrados.map(p => (<div key={p.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center"><div><h3 className="font-semibold">{p.name}</h3><p className="text-green-600">R$ {p.price.toFixed(2)}</p></div><button onClick={() => adicionar(p)} className="bg-amber-700 text-white px-4 py-2 rounded">+</button></div>))}</div></div>
      <div className="bg-white rounded-lg shadow p-4"><h2 className="text-xl font-bold mb-4">Carrinho</h2>{carrinho.length === 0 ? <p className="text-gray-500">Vazio</p> : carrinho.map(i => (<div key={i.produto.id} className="border-b py-2"><div className="flex justify-between"><span>{i.produto.name}</span><button onClick={() => remover(i.produto.id)} className="text-red-500">x</button></div><div className="flex justify-between mt-1"><span>{i.quantidade}x</span><span>R$ {(i.produto.price * i.quantidade).toFixed(2)}</span></div></div>))}<div className="mt-4 pt-4 border-t"><p className="text-xl font-bold">Total: R$ {totalCarrinho.toFixed(2)}</p><button onClick={finalizarVenda} disabled={carrinho.length === 0} className="w-full bg-green-600 text-white py-3 rounded mt-4 disabled:opacity-50">Finalizar</button></div></div>
      
      {modalPagamento && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-2xl p-8 w-96"><div className="text-center mb-6"><div className="text-5xl mb-3">💰</div><h2 className="text-2xl font-bold">Forma de Pagamento</h2><p className="text-gray-500 mt-1">Total: R$ {totalCarrinho.toFixed(2)}</p></div><div className="space-y-3"><button onClick={() => setPagamentoSelecionado('dinheiro')} className={'w-full p-4 rounded-xl border-2 ' + (pagamentoSelecionado === 'dinheiro' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>💵 Dinheiro</button><button onClick={() => setPagamentoSelecionado('cartao_credito')} className={'w-full p-4 rounded-xl border-2 ' + (pagamentoSelecionado === 'cartao_credito' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>💳 Cartão Crédito</button><button onClick={() => setPagamentoSelecionado('cartao_debito')} className={'w-full p-4 rounded-xl border-2 ' + (pagamentoSelecionado === 'cartao_debito' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>💳 Cartão Débito</button><button onClick={() => setPagamentoSelecionado('pix')} className={'w-full p-4 rounded-xl border-2 ' + (pagamentoSelecionado === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200')}>📱 PIX</button></div><div className="flex gap-3 mt-6"><button onClick={confirmarPagamento} disabled={!pagamentoSelecionado} className="flex-1 bg-green-600 text-white py-3 rounded">Confirmar</button><button onClick={() => { setModalPagamento(false); setPagamentoSelecionado('') }} className="flex-1 bg-gray-300 py-3 rounded">Cancelar</button></div></div></div>)}
    </div>
  )
}