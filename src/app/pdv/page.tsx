'use client'

import MenuLayout from '../MenuLayout'

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Produto {
  id: string
  name: string
  price: number
  stock: number
}

export default function ComLayout() { return <MenuLayout><Conteudo /></MenuLayout>; } function Conteudo() { return PDVPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carrinho, setCarrinho] = useState<{ produto: Produto; quantidade: number }[]>([])
  const [busca, setBusca] = useState('')
  const [modalPagamento, setModalPagamento] = useState(false)

  useEffect(() => { carregarProdutos() }, [])

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

  const atualizarQuantidade = (id: string, quantidade: number) => {
    if (quantidade <= 0) { removerDoCarrinho(id); return }
    setCarrinho(prev => prev.map(i => i.produto.id === id ? { ...i, quantidade } : i))
  }

  const totalCarrinho = carrinho.reduce((sum, i) => sum + i.produto.price * i.quantidade, 0)

  async function finalizarVenda(formaPagamento: string) {
    // Registrar venda
    const { data: venda, error } = await supabase
      .from('vendas')
      .insert({ company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8', total: totalCarrinho, payment_method: formaPagamento })
      .select()
      .single()

    if (error) { alert('Erro ao finalizar venda'); return }

    // Registrar itens da venda
    for (const item of carrinho) {
      await supabase.from('vendas_itens').insert({
        venda_id: venda.id,
        product_id: item.produto.id,
        quantity: item.quantidade,
        price: item.produto.price,
        total: item.produto.price * item.quantidade
      })
      
      // Atualizar estoque
      await supabase.from('products').update({ stock: item.produto.stock - item.quantidade }).eq('id', item.produto.id)
    }

    alert('Venda finalizada! Total: R$ ' + totalCarrinho.toFixed(2))
    setCarrinho([])
    setModalPagamento(false)
    carregarProdutos()
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">ðŸ›’ Ponto de Venda</h1>
        <input type="text" placeholder="Buscar produto..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-4" />
        <div className="grid sm:grid-cols-2 gap-4">
          {produtosFiltrados.map(produto => (
            <div key={produto.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
              <div><h3 className="font-semibold">{produto.name}</h3><p className="text-green-600 font-bold">R$ {produto.price.toFixed(2)}</p><p className="text-sm text-gray-500">Estoque: {produto.stock}</p></div>
              <button onClick={() => adicionarAoCarrinho(produto)} className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg">+</button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 h-fit">
        <h2 className="text-xl font-bold mb-4">Carrinho</h2>
        {carrinho.length === 0 ? <p className="text-gray-500">Vazio</p> : (
          <div className="space-y-3">
            {carrinho.map(i => (
              <div key={i.produto.id} className="border-b pb-2">
                <div className="flex justify-between"><p className="font-medium">{i.produto.name}</p><button onClick={() => removerDoCarrinho(i.produto.id)} className="text-red-500 text-sm">Remover</button></div>
                <div className="flex justify-between items-center mt-1"><div className="flex items-center gap-2"><button onClick={() => atualizarQuantidade(i.produto.id, i.quantidade - 1)} className="px-2 bg-gray-200 rounded">-</button><span>{i.quantidade}</span><button onClick={() => atualizarQuantidade(i.produto.id, i.quantidade + 1)} className="px-2 bg-gray-200 rounded">+</button></div><p className="font-bold">R$ {(i.produto.price * i.quantidade).toFixed(2)}</p></div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t"><p className="text-xl font-bold">Total: R$ {totalCarrinho.toFixed(2)}</p><button onClick={() => setModalPagamento(true)} disabled={carrinho.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg mt-4 disabled:opacity-50">Finalizar Venda</button></div>
      </div>

      {modalPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96"><h2 className="text-xl font-bold mb-4">Forma de Pagamento</h2>
            <div className="space-y-3"><button onClick={() => finalizarVenda('dinheiro')} className="w-full bg-green-600 text-white py-3 rounded">ðŸ’µ Dinheiro</button><button onClick={() => finalizarVenda('cartao_credito')} className="w-full bg-blue-600 text-white py-3 rounded">ðŸ’³ CartÃ£o de CrÃ©dito</button><button onClick={() => finalizarVenda('cartao_debito')} className="w-full bg-blue-500 text-white py-3 rounded">ðŸ’³ CartÃ£o de DÃ©bito</button><button onClick={() => finalizarVenda('pix')} className="w-full bg-green-500 text-white py-3 rounded">ðŸ“± PIX</button></div>
            <button onClick={() => setModalPagamento(false)} className="w-full mt-4 bg-gray-300 py-2 rounded">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
} }
