import { prisma } from '@/lib/prisma'

interface Props {
  location: string
  className?: string
}

/**
 * Exibe banners particulares para uma localização específica.
 * Server Component — lê diretamente do banco.
 * Retorna null se não houver banners ativos para a localização.
 */
export default async function BannerZone({ location, className = '' }: Props) {
  try {
    const banners = await prisma.banner.findMany({
      where: { location, active: true },
      orderBy: { order: 'asc' },
    })

    if (!banners.length) return null

    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 py-3 ${className}`}>
        {banners.map(banner => {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner.imageUrl}
              alt={banner.altText ?? banner.name}
              width={banner.width ?? undefined}
              height={banner.height ?? undefined}
              style={{ maxWidth: '100%', display: 'block' }}
              loading="lazy"
            />
          )

          return banner.linkUrl ? (
            <a
              key={banner.id}
              href={banner.linkUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              title={banner.name}
            >
              {img}
            </a>
          ) : (
            <div key={banner.id}>{img}</div>
          )
        })}
      </div>
    )
  } catch {
    return null
  }
}
