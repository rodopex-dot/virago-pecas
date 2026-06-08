import { prisma } from '@/lib/prisma'
import { BANNER_LOCATIONS } from '@/lib/bannerLocations'

interface Props {
  location: string
  className?: string
}

/**
 * Exibe banners particulares para uma localização.
 * As dimensões são determinadas pela config do BANNER_LOCATIONS — não pelo banner em si.
 * Server Component — lê diretamente do banco.
 */
export default async function BannerZone({ location, className = '' }: Props) {
  const meta = BANNER_LOCATIONS[location]

  try {
    const banners = await prisma.banner.findMany({
      where: { active: true, locations: { has: location } },
      orderBy: { order: 'asc' },
    })

    if (!banners.length) return null

    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 ${className}`}>
        {banners.map(banner => {
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner.imageUrl}
              alt={banner.altText ?? banner.name}
              width={meta?.width}
              height={meta?.height}
              style={{
                width:    meta ? `${meta.width}px`  : undefined,
                height:   meta ? `${meta.height}px` : undefined,
                maxWidth: '100%',
                display:  'block',
              }}
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
