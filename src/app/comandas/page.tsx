'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Command = {
  id: string
  table_number: string | null
  status: string
  total: number
  created_at: string
}

const companyId = process.env.NEXT_PUBLIC_COMPANY_ID ?? ''

export default function ComandasPage() {
  const [commands, setCommands] = useState<Command[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCommands() {
      setLoading(true)
      let query = supabase
        .from('commands')
        .select('id,table_number,status,total,created_at')

      if (companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else if (data) {
        setCommands(data)
      }
      setLoading(false)
    }

    loadCommands()
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h1 className="text-2xl font-semibold text-slate-950">Comandas</h1>
        <p className="mt-2 text-sm text-slate-600">Veja o histórico de comandas e abra novas ordens.</p>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        {loading ? (
          <p>Carregando comandas...</p>
        ) : commands.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhuma comanda encontrada. Crie uma venda no PDV.</p>
        ) : (
          <div className="grid gap-4">
            {commands.map((command) => (
              <Link
                key={command.id}
                href={`/comandas/${command.id}`}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">Comanda {command.table_number ?? '—'}</p>
                    <p className="mt-1 text-sm text-slate-500">Status: {command.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-lg font-semibold text-slate-950">R$ {command.total.toFixed(2)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
