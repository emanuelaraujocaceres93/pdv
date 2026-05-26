'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type CommandItem = {
  id: string
  product_id: string
  quantity: number
  unit_price: number
}

type Command = {
  id: string
  table_number: string | null
  status: string
  total: number
  created_at: string
}

export default function CommandDetailPage() {
  const params = useParams()
  const commandId = params?.id as string
  const [command, setCommand] = useState<Command | null>(null)
  const [items, setItems] = useState<CommandItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!commandId) return

    async function loadCommand() {
      setLoading(true)
      const { data: commandData, error: commandError } = await supabase
        .from('commands')
        .select('id,table_number,status,total,created_at')
        .eq('id', commandId)
        .single()

      if (commandError) {
        setError(commandError.message)
        setLoading(false)
        return
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('command_items')
        .select('id,product_id,quantity,unit_price')
        .eq('command_id', commandId)

      if (itemsError) {
        setError(itemsError.message)
      }

      setCommand(commandData)
      setItems(itemsData ?? [])
      setLoading(false)
    }

    loadCommand()
  }, [commandId])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h1 className="text-2xl font-semibold text-slate-950">Detalhes da comanda</h1>
        <p className="mt-2 text-sm text-slate-600">Visualize o pedido e os itens ligados à comanda.</p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">Carregando...</div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : !command ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">Comanda não encontrada.</div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">ID</p>
              <p className="mt-1 text-sm text-slate-900">{command.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Mesa</p>
              <p className="mt-1 text-sm text-slate-900">{command.table_number ?? 'Não informada'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-1 text-sm text-slate-900">{command.status}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="mt-1 text-sm text-slate-900">R$ {command.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <h2 className="text-lg font-semibold text-slate-950">Itens</h2>
            {items.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum item registrado para esta comanda.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-medium text-slate-950">Produto ID: {item.product_id}</p>
                    <p className="text-sm text-slate-600">Quantidade: {item.quantity}</p>
                    <p className="text-sm text-slate-600">Preço unitário: R$ {item.unit_price.toFixed(2)}</p>
                    <p className="text-sm text-slate-600">Subtotal: R$ {(item.quantity * item.unit_price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
