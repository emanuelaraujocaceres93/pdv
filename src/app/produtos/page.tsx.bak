'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Produto {
  id: string
  name: string
  price: number
  stock: number
  min_stock: number
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '', min_stock: '' })

  useEffect(() => { carregarProdutos() }, [])

  async function carregarProdutos() {
    const { data } = await supabase.from('products').select('*').order('name')
    if (data) setProdutos(data)
    setLoading(false)
  }

  function abrirModal(produto?: Produto) {
    if (produto) {
      setEditando(produto)
      setForm({ name: produto.name, price: produto.price.toString(), stock: produto.stock.toString(), min_stock: produto.min_stock?.toString() || '5' })
    } else {
      setEditando(null)
      setForm({ name: '', price: '', stock: '', min_stock: '5' })
    }
    setModalAberto(true)
  }

  async function salvarProduto() {
    const dados = { name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock), min_stock: parseInt(form.min_stock), company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8' }
    if (editando) {
      await supabase.from('products').update(dados).eq('id', editando.id)
    } else {
      await supabase.from('products').insert(dados)
    }
    setModalAberto(false)
    carregarProdutos()
  }

  async function adicionarEstoque(produto: Produto) {
    const qtd = prompt('Quantidade a adicionar:', '10')
    if (qtd) {
      await supabase.from('products').update({ stock: produto.stock + parseInt(qtd) }).eq('id', produto.id)
      carregarProdutos()
    }
  }

  async function excluirProduto(id: string) {
    if (confirm('Tem certeza?')) {
      await supabase.from('products').delete().eq('id', id)
      carregarProdutos()
    }
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">🍷 Produtos e Estoque</h1>
        <button onClick={() => abrirModal()} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded-lg">+ Novo Produto</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left">Produto</th><th className="px-6 py-3 text-left">Preço</th><th className="px-6 py-3 text-left">Estoque</th><th className="px-6 py-3 text-left">Mínimo</th><th className="px-6 py-3 text-left">Ações</th></tr></thead>
          <tbody>
            {produtos.map(p => (<tr key={p.id} className={p.stock < p.min_stock ? 'bg-red-50' : ''}><td className="px-6 py-4">{p.name}</td><td className="px-6 py-4">R$ {p.price.toFixed(2)}</td><td className="px-6 py-4">{p.stock}</td><td className="px-6 py-4">{p.min_stock}</td><td className="px-6 py-4"><button onClick={() => abrirModal(p)} className="text-amber-600 mr-2">Editar</button><button onClick={() => adicionarEstoque(p)} className="text-blue-600 mr-2">+Estoque</button><button onClick={() => excluirProduto(p.id)} className="text-red-600">Excluir</button></td></tr>))}
          </tbody>
        </table>
      </div>

      {modalAberto && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-96"><h2 className="text-xl font-bold mb-4">{editando ? 'Editar' : 'Novo'} Produto</h2><input type="text" placeholder="Nome" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" /><input type="number" placeholder="Preço" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" /><input type="number" placeholder="Estoque" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" /><input type="number" placeholder="Estoque Mínimo" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})} className="w-full border rounded px-3 py-2 mb-4" /><div className="flex gap-2"><button onClick={salvarProduto} className="flex-1 bg-amber-700 text-white py-2 rounded">Salvar</button><button onClick={() => setModalAberto(false)} className="flex-1 bg-gray-300 py-2 rounded">Cancelar</button></div></div></div>)}
    </div>
  )
}