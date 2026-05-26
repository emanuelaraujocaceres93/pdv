import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'

interface ProductSearchProps {
  products: Product[]
  onAdd: (product: Product) => void
}

export default function ProductSearch({ products, onAdd }: ProductSearchProps) {
  const [query, setQuery] = useState('')

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        product.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [products, query],
  )

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Produtos</p>
          <h2 className="text-xl font-semibold text-slate-950">Selecione itens para vender</h2>
        </div>
        <input
          aria-label="Buscar produto"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar produto..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:w-64"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          Nenhum produto encontrado. Verifique se há produtos cadastrados no Supabase.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{product.name}</p>
                  <p className="text-sm text-slate-500">Estoque: {product.stock}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                  R$ {product.price.toFixed(2)}
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onAdd(product)}
              >
                Adicionar
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
