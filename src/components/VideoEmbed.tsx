import { Play, Youtube, Instagram, ExternalLink } from 'lucide-react'

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

function YouTubeEmbed({ video }: { video: VideoReferenceData }) {
  const videoId = getYouTubeId(video.url)
  if (!videoId) return null

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      {video.title && (
        <div className="flex items-center gap-2 bg-zinc-100 px-3 py-2 dark:bg-zinc-900">
          <Youtube className="h-4 w-4 text-red-500" />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{video.title}</span>
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
}

function OtherVideoLink({ video }: { video: VideoReferenceData }) {
  const isInstagram = video.platform === 'instagram'
  const Icon = isInstagram ? Instagram : ExternalLink

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 transition hover:border-orange-500/40 hover:bg-orange-500/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        isInstagram
          ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400'
          : 'bg-zinc-200 dark:bg-zinc-800'
      }`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
          {video.title ?? 'Ver vídeo de referência'}
        </p>
        <p className="text-xs capitalize text-zinc-500">{video.platform}</p>
      </div>
      <Play className="h-4 w-4 shrink-0 text-zinc-400" />
    </a>
  )
}

export default function VideoEmbed({ videos }: VideoEmbedProps) {
  if (!videos.length) return null

  const youtubeVideos = videos.filter(v => v.platform === 'youtube')
  const otherVideos   = videos.filter(v => v.platform !== 'youtube')

  return (
    <div className="mt-4 space-y-3">
      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500">
        <Play className="h-3.5 w-3.5 text-orange-500" />
        Vídeos de Referência
      </h4>

      {/* Embeds YouTube */}
      {youtubeVideos.map(video => (
        <YouTubeEmbed key={video.id} video={video} />
      ))}

      {/* Links outros (Instagram, TikTok etc.) */}
      {otherVideos.map(video => (
        <OtherVideoLink key={video.id} video={video} />
      ))}
    </div>
  )
}
