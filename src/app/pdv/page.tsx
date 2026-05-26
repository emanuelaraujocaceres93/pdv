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

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function carregarProdutos() {
    const { data } = await supabase.from('products').select('*').order('name')
    if (data) setProdutos(data)
  }

  const produtosFiltrados = produtos.filter(p => p.name.toLowerCase().includes(busca.toLowerCase()))

  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho(prev => {
      const existente = prev.find(i => i.produto.id === produto.id)
      if (existente) return prev.map(i => i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i)
      return [...prev, { produto, quantidade: 1 }]
    })
  }

  const removerDoCarrinho = (id: string) => {
    setCarrinho(prev => prev.filter(i => i.produto.id !== id))
  }

  const totalCarrinho = carrinho.reduce((sum, i) => sum + i.produto.price * i.quantidade, 0)

  const finalizarVenda = async () => {
    alert('Venda finalizada! Total: R$ ' + totalCarrinho.toFixed(2))
    setCarrinho([])
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">🛒 Ponto de Venda</h1>
        <input type="text" placeholder="Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4" />
        <div className="grid sm:grid-cols-2 gap-4">
          {produtosFiltrados.map(produto => (
            <div key={produto.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{produto.name}</h3>
                <p className="text-green-600 font-bold">R$ {produto.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Estoque: {produto.stock}</p>
              </div>
              <button onClick={() => adicionarAoCarrinho(produto)} className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition">+</button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-fit">
        <h2 className="text-xl font-bold mb-4">Carrinho</h2>
        {carrinho.length === 0 ? <p className="text-gray-500">Vazio</p> : <div className="space-y-3">{carrinho.map(i => (<div key={i.produto.id} className="flex justify-between items-center border-b pb-2"><div><p className="font-medium">{i.produto.name}</p><p className="text-sm text-gray-500">{i.quantidade}x R$ {i.produto.price.toFixed(2)}</p></div><div><p className="font-bold">R$ {(i.produto.price * i.quantidade).toFixed(2)}</p><button onClick={() => removerDoCarrinho(i.produto.id)} className="text-red-500 text-sm mt-1">Remover</button></div></div>))}</div>}
        <div className="mt-4 pt-4 border-t"><p className="text-xl font-bold">Total: R$ {totalCarrinho.toFixed(2)}</p><button onClick={finalizarVenda} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition mt-4">Finalizar Venda</button></div>
      </div>
    </div>
  )
}