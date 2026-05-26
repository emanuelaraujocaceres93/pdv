'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import Cart from '@/components/Cart'
import ProductSearch from '@/components/ProductSearch'

type Product = {
  id: string
  name: string
  price: number
  stock: number
}

type CartItem = Product & {
  quantity: number
  unit_price: number
}

const companyId = process.env.NEXT_PUBLIC_COMPANY_ID ?? ''

export default function PdvPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('id,name,price,stock')
        .order('name', { ascending: true })

      if (error) {
        setMessage(error.message)
      } else if (data) {
        setProducts(data)
      }
      setLoading(false)
    }

    loadProducts()
  }, [])

  const onAdd = (product: Product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { ...product, quantity: 1, unit_price: product.price }]
    })
  }

  const onRemove = (productId: string) => {
    setItems((current) => current.filter((item) => item.id !== productId))
  }

  const onQuantityChange = (productId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    )
  }

  const onCheckout = async () => {
    if (items.length === 0) {
      setMessage('Adicione itens ao carrinho antes de finalizar.')
      return
    }

    setLoading(true)
    const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
    if (!companyId) {
      setMessage('Defina NEXT_PUBLIC_COMPANY_ID no .env.local antes de usar o PDV.')
      setLoading(false)
      return
    }

    const commandPayload = {
      company_id: companyId,
      table_number: '1',
      status: 'open',
      total,
    }

    const { data: commandData, error: commandError } = await supabase
      .from('commands')
      .insert(commandPayload)
      .select('id')
      .single()

    if (commandError || !commandData) {
      setMessage(commandError?.message ?? 'Falha ao criar comandas.')
      setLoading(false)
      return
    }

    const itemsPayload = items.map((item) => ({
      command_id: commandData.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))

    const { error: itemsError } = await supabase.from('command_items').insert(itemsPayload)

    if (itemsError) {
      setMessage(itemsError.message)
    } else {
      setMessage('Venda registrada com sucesso!')
      setItems([])
    }

    setLoading(false)
  }

  const summary = useMemo(() => {
    return items.length > 0
      ? `${items.length} item(s) no carrinho, total R$ ${items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toFixed(2)}`
      : 'Selecione produtos para iniciar uma venda.'
  }, [items])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
        <h1 className="text-2xl font-semibold text-slate-950">PDV</h1>
        <p className="mt-2 text-sm text-slate-600">Venda rápida com produtos do estoque e registro de comandas.</p>
      </div>

      {message ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ProductSearch products={products} onAdd={onAdd} />
        <div className="space-y-6">
          <Cart
            items={items}
            onRemove={onRemove}
            onCheckout={onCheckout}
            onQuantityChange={onQuantityChange}
          />
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            {loading ? 'Carregando...' : summary}
          </div>
        </div>
      </div>
    </div>
  )
}
