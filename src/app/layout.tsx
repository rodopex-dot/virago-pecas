import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Virago 250 Peças - Compatibilidade de Peças',
  description:
    'Encontre peças compatíveis para sua Yamaha Virago 250. Banco de dados completo com níveis de compatibilidade, instruções de adaptação e links de compra.',
  keywords: 'Yamaha Virago 250, peças compatíveis, moto, adaptação, freio, suspensão',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
