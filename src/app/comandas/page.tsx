'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Comanda {
  id: string
  table_number: string
  status: string
  total: number
  created_at: string
}

export default function ComandasPage() {
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)
  const [modalComanda, setModalComanda] = useState(false)
  const [modalProdutos, setModalProdutos] = useState<Comanda | null>(null)
  const [produtos, setProdutos] = useState<any[]>([])
  const [itens, setItens] = useState<any[]>([])
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
    if (data) setItens(data)
  }

  async function criarComanda() {
    if (!novaMesa) { alert('Digite o número da mesa ou nome do cliente'); return }
    const { error } = await supabase.from('commands').insert({ table_number: novaMesa, status: 'aberta', total: 0, company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8' })
    if (!error) { setModalComanda(false); setNovaMesa(''); carregarComandas() }
  }

  async function adicionarProduto(commandId: string, product: any) {
    const { data: itemExistente } = await supabase.from('command_items').select('*').eq('command_id', commandId).eq('product_id', product.id).single()
    if (itemExistente) {
      await supabase.from('command_items').update({ quantity: itemExistente.quantity + 1 }).eq('id', itemExistente.id)
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
  }

  async function fecharComanda(comanda: Comanda) {
    if (itens.length === 0) { alert('Adicione produtos à comanda primeiro!'); return }
    // Registrar venda
    const { data: venda } = await supabase.from('vendas').insert({ company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8', total: comanda.total, payment_method: 'pendente', status: 'pendente' }).select().single()
    for (const item of itens) {
      await supabase.from('vendas_itens').insert({ venda_id: venda.id, product_id: item.product_id, quantity: item.quantity, price: item.price, total: item.price * item.quantity })
      await supabase.from('products').update({ stock: item.products.stock - item.quantity }).eq('id', item.product_id)
    }
    await supabase.from('commands').update({ status: 'fechada' }).eq('id', comanda.id)
    alert('Comanda fechada! Total: R$ ' + comanda.total.toFixed(2))
    setModalProdutos(null)
    carregarComandas()
  }

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">📋 Comandas</h1>
        <button onClick={() => setModalComanda(true)} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded-lg">+ Nova Comanda</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comandas.map((comanda) => (<div key={comanda.id} className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg" onClick={() => { setModalProdutos(comanda); carregarItens(comanda.id) }}>
          <div className="flex justify-between items-start"><div><h3 className="text-xl font-semibold text-amber-800">{comanda.table_number}</h3><p className="text-sm text-gray-500">{new Date(comanda.created_at).toLocaleString()}</p></div>
          <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-700">Aberta</span></div>
          <p className="text-2xl font-bold text-green-600 mt-4">R$ {comanda.total.toFixed(2)}</p>
        </div>))}
      </div>

      {modalComanda && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-6 w-96"><h2 className="text-xl font-bold mb-4">Nova Comanda</h2>
        <input type="text" placeholder="Número da Mesa ou Cliente" value={novaMesa} onChange={e => setNovaMesa(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
        <div className="flex gap-2"><button onClick={criarComanda} className="flex-1 bg-amber-700 text-white py-2 rounded">Criar</button><button onClick={() => setModalComanda(false)} className="flex-1 bg-gray-300 py-2 rounded">Cancelar</button></div>
      </div></div>)}

      {modalProdutos && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"><div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">Comanda: {modalProdutos.table_number}</h2><button onClick={() => setModalProdutos(null)} className="text-gray-500 text-2xl">&times;</button></div>
        <div className="grid lg:grid-cols-2 gap-6"><div><h3 className="font-bold mb-2">Adicionar Produtos</h3><div className="space-y-2 max-h-96 overflow-y-auto">{produtos.map(p => (<div key={p.id} className="flex justify-between items-center border-b py-2"><div><p className="font-medium">{p.name}</p><p className="text-sm text-gray-500">R$ {p.price.toFixed(2)}</p></div><button onClick={() => adicionarProduto(modalProdutos.id, p)} className="bg-amber-700 text-white px-3 py-1 rounded">+</button></div>))}</div></div>
        <div><h3 className="font-bold mb-2">Itens da Comanda</h3><div className="space-y-2 max-h-96 overflow-y-auto">{itens.map(item => (<div key={item.id} className="flex justify-between items-center border-b py-2"><div><p className="font-medium">{item.products.name}</p><p className="text-sm">{item.quantity}x R$ {item.price.toFixed(2)} = R$ {(item.price * item.quantity).toFixed(2)}</p></div><button onClick={() => removerItem(item.id, modalProdutos.id)} className="text-red-500 text-sm">Remover</button></div>))}</div>
        <div className="mt-4 pt-4 border-t"><p className="text-xl font-bold">Total: R$ {itens.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</p><button onClick={() => fecharComanda(modalProdutos)} className="w-full mt-3 bg-green-600 text-white py-2 rounded">Fechar Comanda e Finalizar</button></div></div></div>
      </div></div>)}
    </div>
  )
}