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
  const [modalPagamento, setModalPagamento] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [itens, setItens] = useState<ItemComanda[]>([])
  const [novaMesa, setNovaMesa] = useState('')
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState('')

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
    if (!novaMesa.trim()) { alert('Digite o nÃºmero da mesa'); return }
    await supabase.from('commands').insert({ table_number: novaMesa, status: 'aberta', total: 0, company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8' })
    setModalComanda(false)
    setNovaMesa('')
    carregarComandas()
  }

  async function adicionarProduto(commandId: string, product: Produto) {
    const { data: existing } = await supabase.from('command_items').select('*').eq('command_id', commandId).eq('product_id', product.id).maybeSingle()
    if (existing) {
      await supabase.from('command_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
    } else {
      await supabase.from('command_items').insert({ command_id: commandId, product_id: product.id, quantity: 1, price: product.price })
    }
    await atualizarTotalComanda(commandId)
    if (modalProdutos) await carregarItens(commandId)
  }

  async function removerItem(itemId: string, commandId: string) {
    await supabase.from('command_items').delete().eq('id', itemId)
    await atualizarTotalComanda(commandId)
    if (modalProdutos) await carregarItens(commandId)
  }

  async function atualizarTotalComanda(commandId: string) {
    const { data: items } = await supabase.from('command_items').select('price, quantity').eq('command_id', commandId)
    const total = items?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0
    await supabase.from('commands').update({ total }).eq('id', commandId)
    carregarComandas()
  }

  async function confirmarPagamento() {
    if (!pagamentoSelecionado) { alert('Selecione uma forma de pagamento'); return }
    const comanda = modalProdutos!
    
    await supabase.from('vendas').insert({ company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8', total: comanda.total, payment_method: pagamentoSelecionado }).select().single()
    await supabase.from('movimentacoes_caixa').insert({ tipo: 'venda', valor: comanda.total, descricao: 'Venda comanda ' + comanda.table_number })
    
    for (const item of itens) {
      await supabase.from('vendas_itens').insert({ venda_id: 'temp', product_id: item.product_id, quantity: item.quantity, price: item.price, total: item.price * item.quantity })
      const { data: produto } = await supabase.from('products').select('stock').eq('id', item.product_id).single()
      if (produto) await supabase.from('products').update({ stock: produto.stock - item.quantity }).eq('id', item.product_id)
    }
    
    await supabase.from('commands').update({ status: 'fechada' }).eq('id', comanda.id)
    alert('âœ… Venda finalizada! Total: R$ ' + comanda.total.toFixed(2))
    setModalPagamento(false)
    setModalProdutos(null)
    setPagamentoSelecionado('')
    carregarComandas()
    router.push('/caixa')
  }

  const totalItens = itens.reduce((sum, i) => sum + (i.price * i.quantity), 0)

  if (loading) return <div className="text-center py-10">Carregando comandas...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-amber-800">ðŸ“‹ Comandas</h1>
        <button onClick={() => setModalComanda(true)} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded-lg text-sm md:text-base">+ Nova Comanda</button>
      </div>

      {comandas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center"><p className="text-gray-500">Nenhuma comanda aberta.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {comandas.map((comanda) => (
            <div key={comanda.id} className="bg-white rounded-lg shadow-md p-4 md:p-6 cursor-pointer hover:shadow-lg transition" onClick={() => { setModalProdutos(comanda); carregarItens(comanda.id) }}>
              <div className="flex justify-between items-start"><div><h3 className="text-base md:text-xl font-semibold text-amber-800">{comanda.table_number}</h3><p className="text-xs md:text-sm text-gray-500">{new Date(comanda.created_at).toLocaleString()}</p></div><span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Aberta</span></div>
              <p className="text-lg md:text-2xl font-bold text-green-600 mt-3 md:mt-4">R$ {comanda.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nova Comanda - centralizado e com scroll */}
      {modalComanda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-amber-800 mb-4 text-center">Nova Comanda</h2>
            <p className="text-sm text-gray-500 mb-2 text-center">NÃºmero da Mesa</p>
            <input 
              type="text" 
              placeholder="Ex: Mesa 01" 
              value={novaMesa} 
              onChange={e => setNovaMesa(e.target.value)} 
              className="w-full border rounded-lg px-4 py-3 text-base mb-6 text-center text-lg"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={criarComanda} className="flex-1 bg-amber-700 text-white py-3 rounded-lg font-bold">Criar</button>
              <button onClick={() => setModalComanda(false)} className="flex-1 bg-gray-300 py-3 rounded-lg font-bold">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Produtos da Comanda */}
      {modalProdutos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-6xl my-8">
            <div className="flex justify-between items-center mb-4 md:mb-6"><h2 className="text-xl md:text-2xl font-bold text-amber-800">Comanda: {modalProdutos.table_number}</h2><button onClick={() => setModalProdutos(null)} className="text-gray-500 text-2xl md:text-3xl">&times;</button></div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="w-full md:w-[60%]"><h3 className="font-bold text-sm md:text-lg mb-2 md:mb-4">ðŸ“¦ Adicionar Produtos</h3><div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[500px] overflow-y-auto pr-2">{produtos.map(p => (<div key={p.id} className="flex justify-between items-center border-b py-2 md:py-3"><div><p className="font-medium text-sm md:text-base">{p.name}</p><p className="text-green-600 font-semibold text-xs md:text-sm">R$ {p.price.toFixed(2)}</p></div><button onClick={() => adicionarProduto(modalProdutos.id, p)} className="bg-amber-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm">+ Adicionar</button></div>))}</div></div>
              <div className="w-full md:w-[40%]"><h3 className="font-bold text-sm md:text-lg mb-2 md:mb-4">ðŸ›’ Itens da Comanda</h3><div className="space-y-2 md:space-y-3 max-h-[300px] md:max-h-[500px] overflow-y-auto pr-2">{itens.length === 0 ? <p className="text-gray-400 text-center py-6 md:py-8 text-sm">Nenhum item adicionado</p> : itens.map(item => (<div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-2 md:p-3"><div><p className="font-medium text-sm md:text-base">{item.products.name}</p><p className="text-xs text-gray-500">{item.quantity}x R$ {item.price.toFixed(2)} = <span className="font-semibold text-green-600">R$ {(item.price * item.quantity).toFixed(2)}</span></p></div><button onClick={() => removerItem(item.id, modalProdutos.id)} className="text-red-500 text-xs md:text-sm">Remover</button></div>))}</div><div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t"><div className="flex justify-between items-center mb-3 md:mb-4"><span className="text-base md:text-xl font-bold">Total:</span><span className="text-lg md:text-2xl font-bold text-green-600">R$ {totalItens.toFixed(2)}</span></div><button onClick={() => setModalPagamento(true)} className="w-full bg-green-600 text-white font-bold py-2 md:py-3 rounded-lg text-sm md:text-lg">ðŸ’° Fechar Comanda</button></div></div>
            </div>
          </div>
        </div>
      )}

      {modalPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 md:p-6 w-full max-w-md"><div className="text-center mb-4 md:mb-6"><div className="text-4xl md:text-5xl mb-2 md:mb-3">ðŸ’°</div><h2 className="text-xl md:text-2xl font-bold">Forma de Pagamento</h2><p className="text-gray-500 mt-1">Total: <span className="font-bold text-green-600">R$ {totalItens.toFixed(2)}</span></p></div>
            <div className="space-y-2 md:space-y-3"><button onClick={() => setPagamentoSelecionado('dinheiro')} className={'w-full p-3 md:p-4 rounded-xl border-2 text-left flex items-center gap-3 ' + (pagamentoSelecionado === 'dinheiro' ? 'border-green-500 bg-green-50' : 'border-gray-200')}><span className="text-xl md:text-2xl">ðŸ’µ</span><span>Dinheiro</span>{pagamentoSelecionado === 'dinheiro' && <span className="ml-auto text-green-500">âœ“</span>}</button><button onClick={() => setPagamentoSelecionado('cartao_credito')} className={'w-full p-3 md:p-4 rounded-xl border-2 text-left flex items-center gap-3 ' + (pagamentoSelecionado === 'cartao_credito' ? 'border-green-500 bg-green-50' : 'border-gray-200')}><span className="text-xl md:text-2xl">ðŸ’³</span><span>CartÃ£o CrÃ©dito</span>{pagamentoSelecionado === 'cartao_credito' && <span className="ml-auto text-green-500">âœ“</span>}</button><button onClick={() => setPagamentoSelecionado('cartao_debito')} className={'w-full p-3 md:p-4 rounded-xl border-2 text-left flex items-center gap-3 ' + (pagamentoSelecionado === 'cartao_debito' ? 'border-green-500 bg-green-50' : 'border-gray-200')}><span className="text-xl md:text-2xl">ðŸ’³</span><span>CartÃ£o DÃ©bito</span>{pagamentoSelecionado === 'cartao_debito' && <span className="ml-auto text-green-500">âœ“</span>}</button><button onClick={() => setPagamentoSelecionado('pix')} className={'w-full p-3 md:p-4 rounded-xl border-2 text-left flex items-center gap-3 ' + (pagamentoSelecionado === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-200')}><span className="text-xl md:text-2xl">ðŸ“±</span><span>PIX</span>{pagamentoSelecionado === 'pix' && <span className="ml-auto text-green-500">âœ“</span>}</button></div>
            <div className="flex gap-3 mt-4 md:mt-6"><button onClick={confirmarPagamento} disabled={!pagamentoSelecionado} className="flex-1 bg-green-600 text-white py-2 md:py-3 rounded-lg">Confirmar</button><button onClick={() => { setModalPagamento(false); setPagamentoSelecionado('') }} className="flex-1 bg-gray-300 py-2 md:py-3 rounded-lg">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
