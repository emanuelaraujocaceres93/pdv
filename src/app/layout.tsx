import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDV Adega",
  description: "Sistema híbrido de PDV e comandas para adegas.",
};

const navItems = [
  { href: "/pdv", label: "PDV" },
  { href: "/comandas", label: "Comandas" },
  { href: "/estoque", label: "Estoque" },
  { href: "/produtos", label: "Produtos" },
  { href: "/caixa", label: "Caixa" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-slate-50 text-slate-900`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-200/40 backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">PDV + Comandas</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Sistema de vendas para adega</h1>
              </div>
              <nav className="flex flex-wrap items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          <main className="mb-10 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
