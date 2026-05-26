'use client'

export default function CaixaPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-amber-800 mb-6">💰 Caixa</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">Resumo do caixa do dia</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span>Total de Vendas:</span>
            <span className="font-bold text-green-600">R$ 0,00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Total em Espécie:</span>
            <span className="font-bold">R$ 0,00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Total no Cartão:</span>
            <span className="font-bold">R$ 0,00</span>
          </div>
          <div className="flex justify-between items-center py-2 bg-amber-50 px-4 -mx-4 rounded-lg mt-4">
            <span className="font-bold">Saldo do Dia:</span>
            <span className="font-bold text-green-600">R$ 0,00</span>
          </div>
        </div>
        <button className="mt-6 w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg transition">
          Fechar Caixa
        </button>
      </div>
    </div>
  )
}