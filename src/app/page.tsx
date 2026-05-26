import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 rounded-2xl p-8 text-white">
          <p className="text-sm uppercase tracking-wide opacity-80">Bem-vindo ao PDV</p>
          <h1 className="mt-3 text-3xl font-bold">Adega do Emanuel</h1>
          <p className="mt-4 text-amber-100">
            Sistema híbrido PDV + Comandas para gestão de vendas, comandas e estoque.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">📊</span>
            <div>
              <p className="text-sm text-gray-500">Vendas Hoje</p>
              <p className="text-2xl font-bold text-green-600">R$ 0,00</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl">📋</span>
            <div>
              <p className="text-sm text-gray-500">Comandas Abertas</p>
              <p className="text-2xl font-bold text-amber-700">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/pdv" className="group rounded-2xl border border-amber-200 bg-white p-6 text-left transition hover:shadow-lg hover:border-amber-300">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🛒</span>
            <h2 className="text-xl font-semibold text-amber-800">Vender no PDV</h2>
          </div>
          <p className="text-sm text-gray-600">Abra o ponto de venda e adicione produtos ao carrinho.</p>
          <span className="inline-block mt-4 text-amber-600 group-hover:translate-x-1 transition">→</span>
        </Link>

        <Link href="/comandas" className="group rounded-2xl border border-amber-200 bg-white p-6 text-left transition hover:shadow-lg hover:border-amber-300">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">📋</span>
            <h2 className="text-xl font-semibold text-amber-800">Comandas</h2>
          </div>
          <p className="text-sm text-gray-600">Gerencie comandas abertas, consulte detalhes e feche pedidos.</p>
          <span className="inline-block mt-4 text-amber-600 group-hover:translate-x-1 transition">→</span>
        </Link>
      </div>
    </div>
  );
}