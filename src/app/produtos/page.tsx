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

  useEffect(() => {
    carregarProdutos()
  }, [])

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')

    if (error) {
      console.error('Erro ao carregar produtos:', error)
    } else {
      setProdutos(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Carregando produtos...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">🍷 Produtos</h1>
        <button className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded-lg transition">
          + Novo Produto
        </button>
      </div>

      {produtos.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Nenhum produto cadastrado ainda.</p>
          <p className="text-sm text-gray-400 mt-2">Clique em "Novo Produto" para adicionar.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <div key={produto.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-amber-800">{produto.name}</h3>
              <p className="text-2xl font-bold text-green-600 mt-2">
                R$ {produto.price.toFixed(2)}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-700">
                  Estoque: {produto.stock}
                </span>
                <button className="text-amber-600 hover:text-amber-800 font-medium">
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}