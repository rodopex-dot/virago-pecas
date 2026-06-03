import { Youtube, Instagram, Play } from 'lucide-react'

interface VideoReferenceData {
  id: string
  url: string
  platform: string
  title?: string | null
}

interface VideoEmbedProps {
  videos: VideoReferenceData[]
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case 'youtube':
      return <Youtube className="h-5 w-5 text-red-600" />
    case 'instagram':
      return <Instagram className="h-5 w-5 text-pink-600" />
    default:
      return <Play className="h-5 w-5 text-gray-600" />
  }
}

export default function VideoEmbed({ videos }: VideoEmbedProps) {
  if (!videos.length) return null

  const youtubeVideos = videos.filter((v) => v.platform === 'youtube')
  const otherVideos = videos.filter((v) => v.platform !== 'youtube')

  return (
    <div className="mt-4 space-y-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Play className="h-4 w-4" />
        Vídeos de Referência
      </h4>

      {youtubeVideos.map((video) => {
        const videoId = getYouTubeId(video.url)
        if (!videoId) return null
        return (
          <div key={video.id} className="overflow-hidden rounded-lg border border-gray-200">
            {video.title && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2">
                <Youtube className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-gray-700">{video.title}</span>
              </div>
            )}
            <div className="relative aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={video.title ?? 'Vídeo de referência'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        )
      })}

      {otherVideos.map((video) => (
        <a
          key={video.id}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-orange-300 hover:bg-orange-50"
        >
          {getPlatformIcon(video.platform)}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">
              {video.title ?? 'Ver vídeo de referência'}
            </p>
            <p className="text-xs capitalize text-gray-500">{video.platform}</p>
          </div>
          <Play className="h-4 w-4 text-gray-400" />
        </a>
      ))}
    </div>
  )
}
