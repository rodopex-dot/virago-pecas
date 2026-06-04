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

function YouTubeThumbnail({ video }: { video: VideoReferenceData }) {
  const videoId = getYouTubeId(video.url)
  if (!videoId) return null

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
    >
      {/* Thumbnail */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
        alt={video.title ?? 'Vídeo de referência'}
        className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Overlay escuro no hover */}
      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />

      {/* Botão play centralizado */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform duration-200 group-hover:scale-110">
          <Play className="h-5 w-5 translate-x-0.5 fill-white text-white" />
        </div>
      </div>

      {/* Título na parte inferior */}
      {video.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-6">
          <p className="line-clamp-1 text-xs font-medium text-white">{video.title}</p>
        </div>
      )}

      {/* Badge YouTube */}
      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5">
        <Youtube className="h-3 w-3 text-red-500" />
        <span className="text-[10px] font-medium text-white">YouTube</span>
      </div>
    </a>
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

      {/* Grid de thumbnails YouTube */}
      {youtubeVideos.length > 0 && (
        <div className={`grid gap-2 ${youtubeVideos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {youtubeVideos.map(video => (
            <YouTubeThumbnail key={video.id} video={video} />
          ))}
        </div>
      )}

      {/* Links outros (Instagram, TikTok etc.) */}
      {otherVideos.map(video => (
        <OtherVideoLink key={video.id} video={video} />
      ))}
    </div>
  )
}
