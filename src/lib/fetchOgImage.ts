/**
 * Busca imagem e preço (Open Graph / JSON-LD) de uma URL de produto.
 * Funciona com Mercado Livre, Shopee, Amazon BR e a maioria dos e-commerces.
 */

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return null

    // Lê os primeiros 80 KB (meta tags + primeiro JSON-LD ficam no <head>)
    const reader = res.body?.getReader()
    if (!reader) return null
    let html = ''
    let totalBytes = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
      totalBytes += value?.length ?? 0
      if (totalBytes > 80_000) { reader.cancel(); break }
    }
    return html
  } catch {
    return null
  }
}

export async function fetchOgImage(url: string): Promise<string | null> {
  const html = await fetchHtml(url)
  if (!html) return null
  return extractImageUrl(html)
}

export async function fetchProductData(url: string): Promise<{ imageUrl: string | null; price: number | null }> {
  const html = await fetchHtml(url)
  if (!html) return { imageUrl: null, price: null }
  return {
    imageUrl: extractImageUrl(html),
    price: extractPrice(html),
  }
}

function extractImageUrl(html: string): string | null {
  const patterns = [
    /property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /property=["']og:image:url["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+property=["']og:image:url["']/i,
    /name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+name=["']twitter:image:src["']/i,
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const imageUrl = match[1].trim()
      if (imageUrl.startsWith('http') && !imageUrl.includes('placeholder')) {
        return imageUrl
      }
    }
  }
  return null
}

function parsePrice(raw: string): number | null {
  // Remove símbolos de moeda, espaços; troca vírgula decimal por ponto
  const cleaned = raw.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
  const value = parseFloat(cleaned)
  return isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null
}

function extractPrice(html: string): number | null {
  // 1. Meta tags de preço (MercadoLivre, Facebook Commerce, Schema.org)
  const metaPatterns = [
    /property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+property=["']product:price:amount["']/i,
    /property=["']og:price:amount["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+property=["']og:price:amount["']/i,
    /itemprop=["']price["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+itemprop=["']price["']/i,
  ]
  for (const pattern of metaPatterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const price = parsePrice(match[1])
      if (price) return price
    }
  }

  // 2. JSON-LD (Schema.org Product → offers.price)
  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const block of jsonLdMatches) {
    try {
      const data = JSON.parse(block[1])
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        // Product direto
        const price = findPriceInLd(item)
        if (price) return price
      }
    } catch { /* ignore */ }
  }

  // 3. MercadoLivre: preço no HTML como "R$ 299,90" ou data-price="299.90"
  const mlPatterns = [
    /data-price=["'](\d+(?:[.,]\d+)?)["']/i,
    /"price"\s*:\s*(\d+(?:\.\d+)?)/i,
    /"selling_price"\s*:\s*(\d+(?:\.\d+)?)/i,
  ]
  for (const pattern of mlPatterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const price = parseFloat(match[1])
      if (isFinite(price) && price > 0) return Math.round(price * 100) / 100
    }
  }

  return null
}

function findPriceInLd(obj: unknown): number | null {
  if (!obj || typeof obj !== 'object') return null
  const o = obj as Record<string, unknown>

  // Verifica offers
  if (o.offers) {
    const offers = Array.isArray(o.offers) ? o.offers : [o.offers]
    for (const offer of offers) {
      const p = (offer as Record<string, unknown>).price
      if (p !== undefined) {
        const val = typeof p === 'string' ? parseFloat(p) : Number(p)
        if (isFinite(val) && val > 0) return Math.round(val * 100) / 100
      }
    }
  }
  // Verifica price direto
  if (o.price !== undefined) {
    const val = typeof o.price === 'string' ? parseFloat(o.price as string) : Number(o.price)
    if (isFinite(val) && val > 0) return Math.round(val * 100) / 100
  }
  return null
}
