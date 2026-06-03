'use client'

import { useEffect, useRef } from 'react'

interface AdBannerClientProps {
  code: string
  slot: string
}

export default function AdBannerClient({ code, slot }: AdBannerClientProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    // Tenta inicializar anúncios do AdSense após inserção no DOM
    try {
      const w = window as typeof window & { adsbygoogle?: unknown[] }
      w.adsbygoogle = w.adsbygoogle ?? []
      w.adsbygoogle.push({})
    } catch {
      // silencioso — código customizado pode não precisar disso
    }
  }, [])

  return (
    <div
      ref={containerRef}
      data-ad-slot={slot}
      className="flex justify-center"
      dangerouslySetInnerHTML={{ __html: code }}
    />
  )
}
