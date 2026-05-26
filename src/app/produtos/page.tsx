'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AddStockModal from '@/components/AddStockModal'

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
  const [modalEstoqueAberto, setModalEstoqueAberto] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [editando, setEditando] = useState<Produto | null>(null)
  const [form, setForm] = useState({ name: '', price: '', stock: '', min_stock: '' })
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
      setForm({ name: produto.name, price: produto.price.toString(), stock: produto.stock.toString(), min_stock: produto.min_stock.toString() })
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

  async function adicionarEstoque(produto: Produto, quantidade: number) {
    await supabase.from('products').update({ stock: produto.stock + quantidade }).eq('id', produto.id)
    setModalEstoqueAberto(false)
    setProdutoSelecionado(null)
    carregarProdutos()
  }

  async function excluirProduto(id: string) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await supabase.from('products').delete().eq('id', id)
      carregarProdutos()
    }
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">🍷 Produtos e Estoque</h1>
        <div className="flex gap-3">
          {filtroBaixo && <button onClick={() => { setFiltroBaixo(false); window.location.href = '/produtos' }} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition">Ver Todos</button>}
          <button onClick={() => abrirModal()} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded-lg transition">+ Novo Produto</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mínimo</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {produtos.map((produto) => {
              const status = produto.stock < produto.min_stock ? '⚠️ Baixo' : '✅ Normal'
              const statusClass = produto.stock < produto.min_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              return (<tr key={produto.id} className={produto.stock < produto.min_stock ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 font-medium">{produto.name}</td>
                <td className="px-6 py-4">R$ {produto.price.toFixed(2)}</td>
                <td className="px-6 py-4">{produto.stock}</td>
                <td className="px-6 py-4">{produto.min_stock}</td>
                <td className="px-6 py-4"><span className={'px-2 py-1 rounded text-xs ' + statusClass}>{status}</span></td>
                <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => abrirModal(produto)} className="text-amber-600 hover:text-amber-800">Editar</button><button onClick={() => { setProdutoSelecionado(produto); setModalEstoqueAberto(true) }} className="text-blue-600 hover:text-blue-800">+ Estoque</button><button onClick={() => excluirProduto(produto.id)} className="text-red-600 hover:text-red-800">Excluir</button></div></td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>

      {modalAberto && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-96"><h2 className="text-xl font-bold text-amber-800 mb-4">{editando ? 'Editar' : 'Novo'} Produto</h2>
        <input type="text" placeholder="Nome do Produto" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-4 py-2 mb-3" />
        <input type="number" placeholder="Preço" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border rounded-lg px-4 py-2 mb-3" />
        <input type="number" placeholder="Estoque" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="w-full border rounded-lg px-4 py-2 mb-3" />
        <input type="number" placeholder="Estoque Mínimo" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: e.target.value })} className="w-full border rounded-lg px-4 py-2 mb-4" />
        <div className="flex gap-3"><button onClick={salvarProduto} className="flex-1 bg-amber-700 text-white py-2 rounded-lg">Salvar</button><button onClick={() => setModalAberto(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancelar</button></div>
      </div></div>)}

      {produtoSelecionado && (<AddStockModal isOpen={modalEstoqueAberto} onClose={() => { setModalEstoqueAberto(false); setProdutoSelecionado(null) }} onConfirm={(qty) => adicionarEstoque(produtoSelecionado, qty)} productName={produtoSelecionado.name} currentStock={produtoSelecionado.stock} />)}
    </div>
  )
}