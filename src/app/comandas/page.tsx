'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

interface Comanda {
  id: string
  table_number: string
  status: string
  total: number
  created_at: string
}

interface Produto {
  id: string
  name: string
  price: number
  stock: number
}

interface ItemComanda {
  id: string
  product_id: string
  quantity: number
  price: number
  products: { name: string; price: number }
}

export default function ComandasPage() {
  const router = useRouter()
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)
  const [modalComanda, setModalComanda] = useState(false)
  const [modalProdutos, setModalProdutos] = useState<Comanda | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [itens, setItens] = useState<ItemComanda[]>([])
  const [novaMesa, setNovaMesa] = useState('')

  useEffect(() => { carregarComandas(); carregarProdutos() }, [])

  async function carregarComandas() {
    const { data } = await supabase.from('commands').select('*').eq('status', 'aberta').order('created_at', { ascending: false })
    if (data) setComandas(data)
    setLoading(false)
  }

  async function carregarProdutos() {
    const { data } = await supabase.from('products').select('*').order('name')
    if (data) setProdutos(data)
  }

  async function carregarItens(commandId: string) {
    const { data } = await supabase.from('command_items').select('*, products(name, price)').eq('command_id', commandId)
    if (data) setItens(data as ItemComanda[])
  }

  async function criarComanda() {
    if (!novaMesa.trim()) { alert('Digite o número da mesa ou nome do cliente'); return }
    const { error } = await supabase.from('commands').insert({ table_number: novaMesa, status: 'aberta', total: 0, company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8' })
    if (!error) { setModalComanda(false); setNovaMesa(''); carregarComandas() }
  }

  async function adicionarProduto(commandId: string, product: Produto) {
    const { data: existing } = await supabase.from('command_items').select('*').eq('command_id', commandId).eq('product_id', product.id).single()
    
    if (existing) {
      await supabase.from('command_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
    } else {
      await supabase.from('command_items').insert({ command_id: commandId, product_id: product.id, quantity: 1, price: product.price })
    }
    
    await atualizarTotalComanda(commandId)
    if (modalProdutos) carregarItens(commandId)
  }

  async function removerItem(itemId: string, commandId: string) {
    await supabase.from('command_items').delete().eq('id', itemId)
    await atualizarTotalComanda(commandId)
    if (modalProdutos) carregarItens(commandId)
  }

  async function atualizarTotalComanda(commandId: string) {
    const { data: items } = await supabase.from('command_items').select('price, quantity').eq('command_id', commandId)
    const total = items?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0
    await supabase.from('commands').update({ total }).eq('id', commandId)
    carregarComandas()
    if (modalProdutos) setModalProdutos({ ...modalProdutos, total })
  }

  async function finalizarComanda(comanda: Comanda) {
    if (itens.length === 0) { alert('Adicione produtos à comanda primeiro!'); return }
    
    const formaPagamento = prompt('Forma de pagamento:\n1 - Dinheiro\n2 - Cartão Crédito\n3 - Cartão Débito\n4 - PIX', '1')
    let paymentMethod = ''
    if (formaPagamento === '1') paymentMethod = 'dinheiro'
    else if (formaPagamento === '2') paymentMethod = 'cartao_credito'
    else if (formaPagamento === '3') paymentMethod = 'cartao_debito'
    else if (formaPagamento === '4') paymentMethod = 'pix'
    else { alert('Pagamento cancelado'); return }
    
    const { data: venda } = await supabase.from('vendas').insert({ 
      company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8', 
      total: comanda.total, 
      payment_method: paymentMethod 
    }).select().single()
    
    for (const item of itens) {
      await supabase.from('vendas_itens').insert({ 
        venda_id: venda.id, 
        product_id: item.product_id, 
        quantity: item.quantity, 
        price: item.price, 
        total: item.price * item.quantity 
      })
      
      const { data: produto } = await supabase.from('products').select('stock').eq('id', item.product_id).single()
      if (produto) {
        await supabase.from('products').update({ stock: produto.stock - item.quantity }).eq('id', item.product_id)
      }
    }
    
    await supabase.from('commands').update({ status: 'fechada' }).eq('id', comanda.id)
    
    alert('Venda finalizada! Total: R$ ' + comanda.total.toFixed(2) + '\nForma de pagamento: ' + paymentMethod)
    setModalProdutos(null)
    carregarComandas()
    router.push('/caixa')
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">📋 Comandas</h1>
        <button onClick={() => setModalComanda(true)} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded-lg transition">+ Nova Comanda</button>
      </div>

      {comandas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center"><p className="text-gray-500">Nenhuma comanda aberta.</p><p className="text-sm text-gray-400 mt-2">Clique em "Nova Comanda" para começar.</p></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comandas.map((comanda) => (<div key={comanda.id} className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition" onClick={() => { setModalProdutos(comanda); carregarItens(comanda.id) }}>
            <div className="flex justify-between items-start"><div><h3 className="text-xl font-semibold text-amber-800">{comanda.table_number}</h3><p className="text-sm text-gray-500">{new Date(comanda.created_at).toLocaleString()}</p></div>
            <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-700">Aberta</span></div>
            <p className="text-2xl font-bold text-green-600 mt-4">R$ {comanda.total.toFixed(2)}</p>
          </div>))}
        </div>
      )}

      {modalComanda && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 w-96"><h2 className="text-xl font-bold text-amber-800 mb-4">Nova Comanda</h2>
        <input type="text" placeholder="Número da Mesa ou Nome do Cliente" value={novaMesa} onChange={e => setNovaMesa(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-amber-500" autoFocus />
        <div className="flex gap-3"><button onClick={criarComanda} className="flex-1 bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition">Criar</button><button onClick={() => setModalComanda(false)} className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400 transition">Cancelar</button></div>
      </div></div>)}

      {modalProdutos && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"><div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto m-4"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-amber-800">Comanda: {modalProdutos.table_number}</h2><button onClick={() => setModalProdutos(null)} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">&times;</button></div>
        <div className="grid lg:grid-cols-2 gap-8"><div><h3 className="font-bold text-lg mb-4 text-gray-700">📦 Adicionar Produtos</h3><div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">{produtos.map(p => (<div key={p.id} className="flex justify-between items-center border-b border-gray-100 py-3"><div><p className="font-medium text-gray-800">{p.name}</p><p className="text-sm text-green-600 font-semibold">R$ {p.price.toFixed(2)}</p></div><button onClick={() => adicionarProduto(modalProdutos.id, p)} className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition">+ Adicionar</button></div>))}</div></div>
        <div><h3 className="font-bold text-lg mb-4 text-gray-700">🛒 Itens da Comanda</h3><div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">{itens.length === 0 ? <p className="text-gray-400 text-center py-8">Nenhum item adicionado</p> : itens.map(item => (<div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3"><div><p className="font-medium text-gray-800">{item.products.name}</p><p className="text-sm text-gray-500">{item.quantity}x R$ {item.price.toFixed(2)} = <span className="font-semibold text-green-600">R$ {(item.price * item.quantity).toFixed(2)}</span></p></div><button onClick={() => removerItem(item.id, modalProdutos.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remover</button></div>))}</div>
        <div className="mt-6 pt-4 border-t border-gray-200"><div className="flex justify-between items-center mb-4"><span className="text-xl font-bold text-gray-700">Total:</span><span className="text-2xl font-bold text-green-600">R$ {itens.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</span></div><button onClick={() => finalizarComanda(modalProdutos)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition text-lg">💰 Fechar Comanda e Finalizar Venda</button></div></div></div>
      </div></div>)}
    </div>
  )
}