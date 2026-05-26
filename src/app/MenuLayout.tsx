'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Não mostrar menu na página de login
  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <>
      <header className="bg-amber-800 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href="/" className="text-2xl font-bold hover:text-amber-200 transition">
              🍷 Adega do Juninho
            </Link>
            <nav className="flex gap-4 flex-wrap">
              <Link href="/" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                📊 Dashboard
              </Link>
              <Link href="/pdv" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                🛒 PDV
              </Link>
              <Link href="/comandas" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                📋 Comandas
              </Link>
              <Link href="/produtos" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                🍷 Produtos
              </Link>
              <Link href="/caixa" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                💰 Caixa
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 min-h-screen">
        {children}
      </main>

      <footer className="bg-amber-800 text-amber-200 text-center py-4 mt-8">
        <p>© 2026 Adega do Juninho - Sistema de PDV</p>
      </footer>
    </>
  )
}