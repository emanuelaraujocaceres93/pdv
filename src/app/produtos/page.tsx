'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Produto {
  id: string
  name: string
  price: number
  purchase_price: number
  stock: number
  min_stock: number
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [form, setForm] = useState({ name: '', price: '', purchase_price: '', stock: '', min_stock: '' })
  const [filtroBaixo, setFiltroBaixo] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setFiltroBaixo(params.get('estoque') === 'baixo')
    carregarProdutos()
  }, [filtroBaixo])

  async function carregarProdutos() {
    const { data: allProducts } = await supabase.from('products').select('*').order('name')
    if (allProducts) {
      if (filtroBaixo) {
        setProdutos(allProducts.filter(p => p.stock < p.min_stock))
      } else {
        setProdutos(allProducts)
      }
    }
    setLoading(false)
  }

  function abrirModal(produto?: Produto) {
    if (produto) {
      setEditando(produto)
      setForm({ 
        name: produto.name, 
        price: produto.price.toString(), 
        purchase_price: produto.purchase_price?.toString() || '',
        stock: produto.stock.toString(), 
        min_stock: produto.min_stock?.toString() || '' 
      })
    } else {
      setEditando(null)
      setForm({ name: '', price: '', purchase_price: '', stock: '', min_stock: '' })
    }
    setModalAberto(true)
  }

  async function salvarProduto() {
    const dados = { 
      name: form.name, 
      price: parseFloat(form.price), 
      purchase_price: parseFloat(form.purchase_price) || 0,
      stock: parseInt(form.stock), 
      min_stock: parseInt(form.min_stock) || 5,
      company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8' 
    }
    
    if (editando) {
      await supabase.from('products').update(dados).eq('id', editando.id)
    } else {
      await supabase.from('products').insert(dados)
    }
    setModalAberto(false)
    carregarProdutos()
  }

  async function adicionarEstoque(produto: Produto) {
    const qtd = prompt('📦 Quantidade a adicionar:', '10')
    if (qtd) {
      await supabase.from('products').update({ stock: produto.stock + parseInt(qtd) }).eq('id', produto.id)
      carregarProdutos()
    }
  }

  async function excluirProduto(id: string) {
    if (confirm('⚠️ Tem certeza?')) {
      await supabase.from('products').delete().eq('id', id)
      carregarProdutos()
    }
  }

  if (loading) return <div className="text-center py-10">📦 Carregando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">🍷 Produtos e Estoque</h1>
        <div className="flex gap-3">
          {filtroBaixo && <button onClick={() => { setFiltroBaixo(false); window.location.href = '/produtos' }} className="bg-gray-500 text-white px-4 py-2 rounded-lg">📋 Ver Todos</button>}
          <button onClick={() => abrirModal()} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded-lg">➕ Novo Produto</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-3 text-left">🍷 Produto</th><th className="px-4 py-3 text-left">💰 Venda</th><th className="px-4 py-3 text-left">📦 Custo</th><th className="px-4 py-3 text-left">📊 Lucro</th><th className="px-4 py-3 text-left">📦 Estoque</th><th className="px-4 py-3 text-left">⚠️ Mínimo</th><th className="px-4 py-3 text-left">⚙️ Ações</th></tr>
          </thead>
          <tbody>
            {produtos.map(p => {
              const lucro = p.price - (p.purchase_price || 0)
              const lucroPercent = p.purchase_price ? ((lucro / p.purchase_price) * 100).toFixed(0) : 0
              const status = p.stock < p.min_stock ? '⚠️ Baixo' : '✅ Normal'
              return (<tr key={p.id} className={p.stock < p.min_stock ? 'bg-red-50' : ''}>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3">R$ {p.price.toFixed(2)}</td>
                <td className="px-4 py-3">R$ {(p.purchase_price || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-green-600">R$ {lucro.toFixed(2)} ({lucroPercent}%)</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">{p.min_stock}</td>
                <td className="px-4 py-3"><button onClick={() => abrirModal(p)} className="text-amber-600 mr-2">✏️</button><button onClick={() => adicionarEstoque(p)} className="text-blue-600 mr-2">➕</button><button onClick={() => excluirProduto(p.id)} className="text-red-600">🗑️</button></td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>

      {modalAberto && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl p-6 w-full max-w-md"><h2 className="text-xl font-bold text-amber-800 mb-4">{editando ? '✏️ Editar' : '➕ Novo'} Produto</h2>
        <label className="block text-sm font-medium mb-1">🍷 Nome</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-4 py-2 mb-3" />
        <label className="block text-sm font-medium mb-1">💰 Preço de Venda</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border rounded-lg px-4 py-2 mb-3" />
        <label className="block text-sm font-medium mb-1">📦 Preço de Compra</label><input type="number" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} className="w-full border rounded-lg px-4 py-2 mb-3" />
        <label className="block text-sm font-medium mb-1">📦 Estoque</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full border rounded-lg px-4 py-2 mb-3" />
        <label className="block text-sm font-medium mb-1">⚠️ Estoque Mínimo</label><input type="number" placeholder="Ex: 5" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} className="w-full border rounded-lg px-4 py-2 mb-4" />
        <div className="flex gap-3"><button onClick={salvarProduto} className="flex-1 bg-amber-700 text-white py-2 rounded-lg">✅ Salvar</button><button onClick={() => setModalAberto(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">❌ Cancelar</button></div>
      </div></div>)}
    </div>
  )
}
