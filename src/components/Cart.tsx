import { Button } from '@/components/ui/button'
import type { CartItem } from '@/types'

interface CartProps {
  items: CartItem[]
  onRemove: (productId: string) => void
  onCheckout: () => Promise<void>
  onQuantityChange: (productId: string, quantity: number) => void
}

export default function Cart({ items, onRemove, onCheckout, onQuantityChange }: CartProps) {
  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="mb-5">
        <p className="text-sm text-slate-500">Carrinho</p>
        <h2 className="text-xl font-semibold text-slate-950">Itens selecionados</h2>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          Adicione produtos ao carrinho para gerar uma venda ou comandar.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">R$ {item.unit_price.toFixed(2)} cada</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
                    onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-700"
                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
                <span>Total: R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
                <button
                  type="button"
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
                  onClick={() => onRemove(item.id)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Total do pedido</p>
          <p className="text-2xl font-semibold text-slate-950">R$ {total.toFixed(2)}</p>
        </div>
        <Button onClick={onCheckout} disabled={items.length === 0} className="w-full sm:w-auto">
          Finalizar venda
        </Button>
      </div>
    </section>
  )
}
