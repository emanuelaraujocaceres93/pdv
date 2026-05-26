import Link from 'next/link'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-amber-50">
        <header className="bg-amber-800 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Link href="/" className="text-2xl font-bold hover:text-amber-200 transition">
                ðŸ· Adega do Juninho
              </Link>
              <nav className="flex gap-4 flex-wrap">
                <Link href="/" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                  ðŸ“Š Dashboard
                </Link>
                <Link href="/pdv" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                  ðŸ›’ PDV
                </Link>
                <Link href="/comandas" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                  ðŸ“‹ Comandas
                </Link>
                <Link href="/produtos" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                  ðŸ· Produtos
                </Link>
                <Link href="/caixa" className="hover:text-amber-200 transition px-3 py-1 rounded hover:bg-amber-700">
                  ðŸ’° Caixa
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 min-h-screen">
          {children}
        </main>

        <footer className="bg-amber-800 text-amber-200 text-center py-4 mt-8">
          <p>Â© 2026 Adega do Juninho - Sistema de PDV</p>
        </footer>
      </body>
    </html>
  )
}
