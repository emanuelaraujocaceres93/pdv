'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Produto {
  id: string
  name: string
  price: number
  stock: number
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '' })

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function carregarProdutos() {
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (!error && data) setProdutos(data)
    setLoading(false)
  }

  function abrirModal(produto?: Produto) {
    if (produto) {
      setEditando(produto)
      setForm({ name: produto.name, price: produto.price.toString(), stock: produto.stock.toString() })
    } else {
      setEditando(null)
      setForm({ name: '', price: '', stock: '' })
    }
    setModalAberto(true)
  }

  async function salvarProduto() {
    const dados = { name: form.name, price: parseFloat(form.price), stock: parseInt(form.stock), company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8' }
    
    if (editando) {
      await supabase.from('products').update(dados).eq('id', editando.id)
    } else {
      await supabase.from('products').insert(dados)
    }
    
    setModalAberto(false)
    carregarProdutos()
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
        <h1 className="text-3xl font-bold text-amber-800">🍷 Produtos</h1>
        <button onClick={() => abrirModal()} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded-lg transition">
          + Novo Produto
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => (
          <div key={produto.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-amber-800">{produto.name}</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">R$ {produto.price.toFixed(2)}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-700">Estoque: {produto.stock}</span>
              <div className="flex gap-2">
                <button onClick={() => abrirModal(produto)} className="text-amber-600 hover:text-amber-800">Editar</button>
                <button onClick={() => excluirProduto(produto.id)} className="text-red-600 hover:text-red-800">Excluir</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{editando ? 'Editar' : 'Novo'} Produto</h2>
            <input type="text" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2 mb-3" />
            <input type="number" placeholder="Preço" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border rounded px-3 py-2 mb-3" />
            <input type="number" placeholder="Estoque" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full border rounded px-3 py-2 mb-4" />
            <div className="flex gap-2">
              <button onClick={salvarProduto} className="flex-1 bg-amber-700 text-white py-2 rounded">Salvar</button>
              <button onClick={() => setModalAberto(false)} className="flex-1 bg-gray-300 py-2 rounded">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}