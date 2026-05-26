'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Produto {
  id: string
  name: string
  stock: number
  price: number
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    carregarEstoque()
  }, [])

  async function carregarEstoque() {
    const { data } = await supabase.from('products').select('*').order('stock', { ascending: true })
    if (data) setProdutos(data)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-800 mb-6">📦 Estoque</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td className="px-6 py-4">{produto.name}</td>
                <td className="px-6 py-4">R$ {produto.price.toFixed(2)}</td>
                <td className="px-6 py-4">{produto.stock}</td>
                <td className="px-6 py-4">
                  <span className={'px-2 py-1 rounded text-sm ' + (produto.stock > 10 ? 'bg-green-100 text-green-700' : produto.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                    {produto.stock > 10 ? 'Bom' : produto.stock > 0 ? 'Atenção' : 'Esgotado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}