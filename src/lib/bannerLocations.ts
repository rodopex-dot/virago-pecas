/**
 * Configuração centralizada das localizações de banner.
 * Dimensões são fixas por localização — o BannerZone e o admin usam este mesmo objeto.
 */
export const BANNER_LOCATIONS: Record<string, {
  label: string
  hint: string
  width: number   // largura do arquivo de imagem recomendada
  height: number  // altura do arquivo de imagem recomendada
  fluid?: boolean // true = ocupa 100% da largura do container (responsivo)
}> = {
  // O site usa max-w-6xl (1152px). Banners "fluid" preenchem a largura disponível.
  'topo':        { label: 'Topo principal',              hint: 'Acima do AdSense — home e página de peça', width: 1152, height: 200, fluid: true },
  'home-topo':   { label: 'Home — acima dos resultados', hint: 'No início da listagem de peças',           width: 728,  height: 90  },
  'home-meio':   { label: 'Home — entre resultados',     hint: 'Entre a 1ª e demais categorias',           width: 468,  height: 60  },
  'home-rodape': { label: 'Home — abaixo dos resultados',hint: 'Após listagem, antes do CTA',              width: 728,  height: 90  },
  'peca-topo':   { label: 'Página de peça — topo',       hint: 'Abaixo do AdSense na página de peça',      width: 728,  height: 90  },
  'peca-rodape': { label: 'Página de peça — rodapé',     hint: 'Antes do CTA de contribuição',             width: 728,  height: 90  },
  'sidebar':     { label: 'Barra lateral',               hint: 'Lateral direita — desktop',                width: 300,  height: 250 },
  'rodape':      { label: 'Rodapé do site',              hint: 'Acima do rodapé global',                   width: 1152, height: 90,  fluid: true },
}
