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
    case 'youtube':  return <Youtube className="h-4 w-4 text-red-500" />
    case 'instagram': return <Instagram className="h-4 w-4 text-pink-400" />
    default:         return <Play className="h-4 w-4 text-zinc-400" />
  }
}

export default function VideoEmbed({ videos }: VideoEmbedProps) {
  if (!videos.length) return null

  const youtubeVideos = videos.filter((v) => v.platform === 'youtube')
  const otherVideos   = videos.filter((v) => v.platform !== 'youtube')

  return (
    <div className="mt-4 space-y-3">
      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
        <Play className="h-3.5 w-3.5 text-orange-500" />
        Vídeos de Referência
      </h4>

      {youtubeVideos.map((video) => {
        const videoId = getYouTubeId(video.url)
        if (!videoId) return null
        return (
          <div key={video.id} className="overflow-hidden rounded-xl border border-zinc-800">
            {video.title && (
              <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2">
                <Youtube className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-zinc-300">{video.title}</span>
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
          className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 transition hover:border-orange-500/40 hover:bg-zinc-900"
        >
          {getPlatformIcon(video.platform)}
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{video.title ?? 'Ver vídeo de referência'}</p>
            <p className="text-xs capitalize text-zinc-500">{video.platform}</p>
          </div>
          <Play className="h-4 w-4 text-zinc-600" />
        </a>
      ))}
    </div>
  )
}
