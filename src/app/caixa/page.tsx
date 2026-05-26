'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Venda {
  id: string
  total: number
  payment_method: string
  created_at: string
}

interface Movimentacao {
  id: string
  tipo: string
  valor: number
  descricao: string
  created_at: string
}

export default function CaixaPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [modalRetirada, setModalRetirada] = useState(false)
  const [valorRetirada, setValorRetirada] = useState('')
  const [descricaoRetirada, setDescricaoRetirada] = useState('')

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    try {
      const { data: vendasData } = await supabase.from('vendas').select('*').order('created_at', { ascending: false })
      if (vendasData) setVendas(vendasData)
      
      const { data: movData } = await supabase.from('movimentacoes_caixa').select('*').order('created_at', { ascending: false })
      if (movData) setMovimentacoes(movData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
    setLoading(false)
  }

  async function fazerRetirada() {
    const valor = parseFloat(valorRetirada)
    if (isNaN(valor) || valor <= 0) {
      alert('Digite um valor válido')
      return
    }

    try {
      const { error } = await supabase.from('movimentacoes_caixa').insert({
        tipo: 'retirada',
        valor: valor,
        descricao: descricaoRetirada || 'Retirada de caixa'
      })

      if (error) {
        console.error('Erro:', error)
        alert('Erro ao registrar retirada: ' + error.message)
        return
      }

      alert('✅ Retirada registrada com sucesso!')
      setModalRetirada(false)
      setValorRetirada('')
      setDescricaoRetirada('')
      carregarDados()
    } catch (error) {
      alert('Erro ao registrar retirada')
    }
  }

  const totalVendas = vendas.reduce((sum, v) => sum + v.total, 0)
  const totalRetiradas = movimentacoes.filter(m => m.tipo === 'retirada').reduce((sum, m) => sum + m.valor, 0)
  const saldoAtual = totalVendas - totalRetiradas

  if (loading) return <div className="text-center py-10">Carregando...</div>

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-amber-800 mb-6">💰 Caixa</h1>
      
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📊 Resumo do Caixa</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b"><span>Total de Vendas:</span><span className="font-bold text-green-600">R$ {totalVendas.toFixed(2)}</span></div>
            <div className="flex justify-between py-2 border-b"><span>Total de Retiradas:</span><span className="font-bold text-red-600">R$ {totalRetiradas.toFixed(2)}</span></div>
            <div className="flex justify-between py-3 bg-amber-50 rounded-lg px-4 -mx-4"><span className="font-bold">Saldo Atual:</span><span className="font-bold text-green-600 text-xl">R$ {saldoAtual.toFixed(2)}</span></div>
          </div>
          <button onClick={() => setModalRetirada(true)} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition">💰 Retirar Dinheiro</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">📋 Últimas Vendas</h2>
        <div className="space-y-2">
          {vendas.length === 0 ? <p className="text-gray-400 text-center py-4">Nenhuma venda registrada</p> : vendas.slice(0, 10).map(v => (
            <div key={v.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between"><span className="font-bold text-green-600">R$ {v.total.toFixed(2)}</span><span className="text-xs text-gray-500">{new Date(v.created_at).toLocaleString()}</span></div>
              <div className="text-xs text-gray-400 mt-1">Pagamento: {v.payment_method}</div>
            </div>
          ))}
        </div>
      </div>

      {modalRetirada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-amber-800 mb-4">💰 Retirar Dinheiro</h2>
            <input type="number" placeholder="Valor" value={valorRetirada} onChange={e => setValorRetirada(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-3" />
            <input type="text" placeholder="Descrição (opcional)" value={descricaoRetirada} onChange={e => setDescricaoRetirada(e.target.value)} className="w-full border rounded-lg px-4 py-2 mb-4" />
            <div className="flex gap-3"><button onClick={fazerRetirada} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Confirmar</button><button onClick={() => setModalRetirada(false)} className="flex-1 bg-gray-300 py-2 rounded-lg">Cancelar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}