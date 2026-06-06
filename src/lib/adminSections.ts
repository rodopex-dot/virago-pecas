export const ADMIN_SECTIONS = [
  { key: 'pecas',       label: 'Peças' },
  { key: 'categorias',  label: 'Categorias' },
  { key: 'sugestoes',   label: 'Sugestões' },
  { key: 'links',       label: 'Links' },
  { key: 'comentarios', label: 'Comentários' },
  { key: 'manuais',     label: 'Manuais' },
  { key: 'mensagens',   label: 'Mensagens' },
  { key: 'anuncios',    label: 'Anúncios' },
  { key: 'afiliados',   label: 'Afiliados' },
] as const

export type AdminSectionKey = (typeof ADMIN_SECTIONS)[number]['key']
