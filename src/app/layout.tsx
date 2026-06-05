import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThemeProvider from '@/components/ThemeProvider'
import { prisma } from '@/lib/prisma'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Virago 250 Peças — Compatibilidade de Peças',
  description:
    'Banco de dados colaborativo de peças compatíveis para Yamaha Virago 250. Níveis de compatibilidade, instruções de adaptação e links de compra.',
  keywords: 'Yamaha Virago 250, peças compatíveis, moto custom, adaptação, freio, suspensão',
}

async function getAdsenseId(): Promise<string | null> {
  try {
    const cfg = await prisma.siteConfig.findUnique({ where: { key: 'adsense_publisher_id' } })
    return cfg?.value ?? null
  } catch {
    return null
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = await getAdsenseId()

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 min-h-0">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
