import { prisma } from '@/lib/prisma'
import AdBannerClient from './AdBannerClient'

interface AdBannerProps {
  slot: 'top' | 'sidebar' | 'inline'
}

/**
 * Componente de anúncio dinâmico.
 * - Lê a configuração do banco de dados.
 * - Renderiza o código do anúncio se o espaço estiver ativo e com código configurado.
 * - Renderiza NADA se inativo ou sem código — sem placeholder visível.
 */
export default async function AdBanner({ slot }: AdBannerProps) {
  try {
    const adSpace = await prisma.adSpace.findUnique({ where: { slot } })

    if (!adSpace?.active || !adSpace.adCode?.trim()) {
      return null
    }

    return <AdBannerClient code={adSpace.adCode} slot={slot} />
  } catch {
    // Em caso de erro de DB, não quebra a página
    return null
  }
}
