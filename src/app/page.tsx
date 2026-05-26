import Link from "next/link";

export default function Home() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm shadow-slate-200/40">
      <section className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Bem-vindo ao PDV</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950 sm:text-5xl">Sistema híbrido PDV + Comandas</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Gestão de vendas, comandas e estoque para adegas. Configure sua conta Supabase, preencha as variáveis de ambiente e comece a operar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/pdv" className="rounded-2xl border border-slate-200 bg-slate-100 px-6 py-5 text-left transition hover:bg-slate-200">
            <h2 className="text-lg font-semibold">Vender no PDV</h2>
            <p className="mt-2 text-sm text-slate-600">Abra o ponto de venda e adicione produtos ao carrinho.</p>
          </Link>

          <Link href="/comandas" className="rounded-2xl border border-slate-200 bg-slate-100 px-6 py-5 text-left transition hover:bg-slate-200">
            <h2 className="text-lg font-semibold">Comandas</h2>
            <p className="mt-2 text-sm text-slate-600">Gerencie comandas abertas, consulte detalhes e feche pedidos.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
