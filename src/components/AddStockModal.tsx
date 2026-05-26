'use client'

interface AddStockModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (quantity: number) => void
  productName: string
  currentStock: number
}

export default function AddStockModal({ isOpen, onClose, onConfirm, productName, currentStock }: AddStockModalProps) {
  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const quantity = parseInt(formData.get('quantity') as string)
    if (quantity > 0) onConfirm(quantity)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold text-amber-800 mb-4">➕ Adicionar Estoque</h2>
        <p className="text-gray-600 mb-2">Produto: <span className="font-semibold">{productName}</span></p>
        <p className="text-gray-600 mb-4">Estoque atual: <span className="font-semibold">{currentStock}</span></p>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade a adicionar</label>
          <input type="number" name="quantity" required min="1" defaultValue="10" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 rounded-lg transition">Adicionar</button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}