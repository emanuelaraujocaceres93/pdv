import Link from 'next/link'
import { headers } from 'next/headers'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-amber-50">
        {children}
      </body>
    </html>
  )
}