'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

  useEffect(() => {
    carregarComandas()
  }, [])

  async function carregarComandas() {
    const { data, error } = await supabase
      .from('commands')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setComandas(data)
    setLoading(false)
  }

  async function criarComanda() {
    const { data, error } = await supabase
      .from('commands')
      .insert({ table_number: 'Nova Mesa', status: 'aberta', total: 0, company_id: 'dfb78f16-530b-4b20-8c26-5f9a4fb972c8' })
      .select()
      .single()

    if (!error && data) {
      window.location.href = '/comandas/' + data.id
    }
  }

  if (loading) return <div className="text-center py-10">Carregando comandas...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-800">📋 Comandas</h1>
        <button onClick={criarComanda} className="bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 px-4 rounded-lg transition">
          + Nova Comanda
        </button>
      </div>

      {comandas.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Nenhuma comanda encontrada.</p>
          <p className="text-sm text-gray-400 mt-2">Clique em "Nova Comanda" para começar.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comandas.map((comanda) => (
            <Link href={'/comandas/' + comanda.id} key={comanda.id}>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-amber-800">{comanda.table_number}</h3>
                    <p className="text-sm text-gray-500">{new Date(comanda.created_at).toLocaleString()}</p>
                  </div>
                  <span className={'px-2 py-1 rounded text-sm ' + (comanda.status === 'aberta' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')}>
                    {comanda.status === 'aberta' ? 'Aberta' : 'Fechada'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-4">R$ {comanda.total.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}