/**
 * Busca a og:image (Open Graph) de uma URL de produto.
 * Funciona com Mercado Livre, Shopee, Amazon BR e a maioria dos e-commerces.
 */
export async function fetchOgImage(url: string): Promise<string | null> {
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

    // Lê apenas os primeiros 50 KB para economizar memória (meta tags ficam no <head>)
    const reader = res.body?.getReader()
    if (!reader) return null
    let html = ''
    let totalBytes = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
      totalBytes += value?.length ?? 0
      if (totalBytes > 50_000) { reader.cancel(); break }
    }

    return extractImageUrl(html)
  } catch {
    return null
  }
}

function extractImageUrl(html: string): string | null {
  // Padrões de meta tags (property e name, em qualquer ordem)
  const patterns = [
    // og:image
    /property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    // og:image:url
    /property=["']og:image:url["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+property=["']og:image:url["']/i,
    // twitter:image
    /name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    // twitter:image:src
    /name=["']twitter:image:src["'][^>]+content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]+name=["']twitter:image:src["']/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) {
      const imageUrl = match[1].trim()
      // Valida que é uma URL de imagem
      if (imageUrl.startsWith('http') && !imageUrl.includes('placeholder')) {
        return imageUrl
      }
    }
  }
  return null
}
