/**
 * Seed de peças compatíveis da Yamaha Virago 250
 * Fonte: pesquisa da comunidade (Advaldo Costa)
 * Execute com: npx tsx prisma/seed-parts.ts
 */

import { PrismaClient, CompatibilityLevel } from '@prisma/client'

const prisma = new PrismaClient()

function mlSearch(q: string) {
  return `https://www.mercadolivre.com.br/busca?q=${encodeURIComponent(q)}`
}

const PARTS: {
  name: string
  category: string
  description?: string
  compatibleParts: {
    name: string
    brand?: string
    partNumber?: string
    compatibilityLevel: CompatibilityLevel
    adaptationText?: string
    notes?: string
    purchaseLink: string
  }[]
}[] = [
  // ─── SUSPENSÃO ────────────────────────────────────────────────────────────
  {
    name: 'Amortecedor Traseiro',
    category: 'Suspensão',
    description: 'Amortecedor traseiro da Virago 250. A altura fica a gosto — vários modelos compatíveis.',
    compatibleParts: [
      {
        name: 'Amortecedor Strada (CBX200)',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Retirar a bucha de metal e fixar direto na borracha do amortecedor. Pode usar a mola cromada do amortecedor original da Virago.',
        purchaseLink: mlSearch('amortecedor strada cbx200'),
      },
      {
        name: 'Amortecedor Kasinski Cruiser II / Faap',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Retirar o anel no meio da bucha. Já vem cromado de fábrica.',
        purchaseLink: mlSearch('amortecedor kasinski cruiser 250'),
      },
      {
        name: 'Amortecedor CB500',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Usar as borrachas do amortecedor original da Virago. É necessário mexer um pouco na chapa do suporte da pedaleira traseira esquerda para o protetor de corrente não pegar.',
        purchaseLink: mlSearch('amortecedor honda cb500'),
      },
      {
        name: 'Amortecedor CG Honda',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        notes: 'Modelos similares de CG também funcionam.',
        purchaseLink: mlSearch('amortecedor honda cg'),
      },
    ],
  },
  {
    name: 'Bengala — Internos (Cilindro, Molas, Retentores)',
    category: 'Suspensão',
    description: 'Cilindro interno, molas, canelas, retentores e guarda-pó da bengala dianteira.',
    compatibleParts: [
      {
        name: 'Kit interno de bengala CB400',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'A CB400 é alguns centímetros menor. Verifique o comprimento antes de instalar.',
        purchaseLink: mlSearch('bengala interna cb400 cilindro retentor'),
      },
    ],
  },
  {
    name: 'Buchas da Balança',
    category: 'Suspensão',
    description: 'Buchas do eixo da balança traseira.',
    compatibleParts: [
      {
        name: 'Buchas da balança YBR',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('bucha balança YBR 125'),
      },
    ],
  },
  {
    name: 'Rolamento da Caixa de Direção',
    category: 'Suspensão',
    description: 'Rolamentos superior e inferior da caixa de direção. Cada posição usa um modelo diferente.',
    compatibleParts: [
      {
        name: 'Rolamento superior — Factor',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'O rolamento SUPERIOR da caixa de direção é o mesmo da Factor. Possivelmente o mesmo da DT também.',
        purchaseLink: mlSearch('rolamento caixa direção yamaha factor'),
      },
      {
        name: 'Rolamento inferior — YBR',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'O rolamento INFERIOR da caixa de direção é o mesmo da YBR.',
        purchaseLink: mlSearch('rolamento caixa direção yamaha ybr'),
      },
    ],
  },
  {
    name: 'Rolamento das Rodas',
    category: 'Suspensão',
    description: 'Rolamento das rodas dianteira e traseira.',
    compatibleParts: [
      {
        name: 'Rolamento 6202 (universal)',
        partNumber: '6202',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Número 6202. Encontrado em qualquer distribuidora de rolamentos.',
        purchaseLink: mlSearch('rolamento 6202'),
      },
    ],
  },

  // ─── ELÉTRICA ─────────────────────────────────────────────────────────────
  {
    name: 'Bateria',
    category: 'Elétrica',
    description: 'Bateria da Virago 250.',
    compatibleParts: [
      {
        name: 'Bateria Route YTX12LA-BS',
        brand: 'Route',
        partNumber: 'YTX12LA-BS',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('bateria route ytx12la-bs virago 250'),
      },
    ],
  },
  {
    name: 'Bobina de Ignição',
    category: 'Elétrica',
    description: 'Bobina de ignição da Virago 250.',
    compatibleParts: [
      {
        name: 'Bobina Fazer 250 2006/2011 Magnetron',
        brand: 'Magnetron',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Bobina do modelo Fazer 250 anos 2006 a 2011 da marca Magnetron.',
        purchaseLink: mlSearch('bobina ignição fazer 250 magnetron'),
      },
    ],
  },
  {
    name: 'Interruptor de Freio (Stop)',
    category: 'Elétrica',
    description: 'Interruptor de freio no manete — aciona a luz de freio.',
    compatibleParts: [
      {
        name: 'Interruptor de freio Factor',
        brand: 'Yamaha',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Compatível, porém é necessário aumentar um pouco o comprimento dos fios.',
        purchaseLink: mlSearch('interruptor freio manete yamaha factor'),
      },
      {
        name: 'Interruptor de freio YBR',
        brand: 'Yamaha',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Compatível, porém é necessário aumentar um pouco o comprimento dos fios.',
        purchaseLink: mlSearch('interruptor freio manete yamaha ybr'),
      },
    ],
  },
  {
    name: 'Miolo da Chave de Ignição',
    category: 'Elétrica',
    description: 'Miolo (cilindro) da chave de ignição.',
    compatibleParts: [
      {
        name: 'Miolo da chave YBR',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('miolo chave ignição yamaha ybr'),
      },
    ],
  },
  {
    name: 'Motor de Arranque',
    category: 'Elétrica',
    description: 'Motor de arranque (partida elétrica).',
    compatibleParts: [
      {
        name: 'Motor de arranque Factor 125',
        brand: 'Yamaha',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'O suporte e escovas são os mesmos da Virago. O que muda é a tampa onde vão as escovinhas — cada moto tem a sua tampa. Use a tampa original da Virago com as escovas e suporte da Factor.',
        purchaseLink: mlSearch('motor arranque partida yamaha factor 125'),
      },
      {
        name: 'Motor de arranque TDM 225',
        brand: 'Yamaha',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'O suporte e escovas são os mesmos da Virago. O que muda é a tampa onde vão as escovinhas — use a tampa original da Virago com as escovas e suporte da TDM.',
        purchaseLink: mlSearch('motor arranque partida yamaha tdm 225'),
      },
    ],
  },
  {
    name: 'Placa de Partida',
    category: 'Elétrica',
    description: 'Placa de partida (placa do motor de arranque).',
    compatibleParts: [
      {
        name: 'Placa de partida Fazer 250',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Testada e aprovada pela comunidade.',
        purchaseLink: mlSearch('placa partida arranque yamaha fazer 250'),
      },
    ],
  },
  {
    name: 'Relé de Pisca',
    category: 'Elétrica',
    description: 'Relé do pisca (seta). Modelos com apito sonoro têm 2 pinos.',
    compatibleParts: [
      {
        name: 'Relé de pisca Shineray (com apito)',
        brand: 'Shineray',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Relé com apito sonoro, 2 pinos. Conectar no fio preto e no cinza.',
        purchaseLink: mlSearch('relé pisca seta 2 pinos sonoro moto'),
      },
    ],
  },
  {
    name: 'Relé de Partida',
    category: 'Elétrica',
    description: 'Relé de partida (solenoide).',
    compatibleParts: [
      {
        name: 'Relé de partida CB450',
        brand: 'Honda',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('relé partida solenoide honda cb450'),
      },
      {
        name: 'Relé de partida Falcon NX400',
        brand: 'Honda',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('relé partida solenoide honda falcon nx400'),
      },
    ],
  },
  {
    name: 'Sensor da Embreagem',
    category: 'Elétrica',
    description: 'Sensor que impede a partida com a moto engatada.',
    compatibleParts: [
      {
        name: 'Sensor da embreagem Fazer 250',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'O sensor da Fazer é cerca de 100mm menor, mas não atrapalha o funcionamento. Não precisa de nenhuma adaptação.',
        purchaseLink: mlSearch('sensor embreagem yamaha fazer 250'),
      },
    ],
  },

  // ─── CABOS ────────────────────────────────────────────────────────────────
  {
    name: 'Cabo de Embreagem',
    category: 'Cabos',
    description: 'Cabo de embreagem da Virago 250.',
    compatibleParts: [
      {
        name: 'Cabo de embreagem Titan',
        brand: 'Honda',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Serve perfeitamente sem adaptação.',
        purchaseLink: mlSearch('cabo embreagem honda titan'),
      },
      {
        name: 'Cabo de embreagem Bros',
        brand: 'Honda',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Equivalente ao da Titan. Serve perfeitamente.',
        purchaseLink: mlSearch('cabo embreagem honda bros'),
      },
    ],
  },
  {
    name: 'Cabo de Velocímetro',
    category: 'Cabos',
    description: 'Cabo do velocímetro da Virago 250.',
    compatibleParts: [
      {
        name: 'Cabo de velocímetro XTZ 125',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('cabo velocímetro yamaha xtz 125'),
      },
      {
        name: 'Cabo de velocímetro DT 180',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('cabo velocímetro yamaha dt 180'),
      },
      {
        name: 'Cabo de velocímetro DT 200',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('cabo velocímetro yamaha dt 200'),
      },
      {
        name: 'Cabo de velocímetro Ténéré',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('cabo velocímetro yamaha ténéré'),
      },
    ],
  },
  {
    name: 'Manete de Embreagem',
    category: 'Cabos',
    description: 'Manete (alavanca) de embreagem.',
    compatibleParts: [
      {
        name: 'Manete de embreagem RDZ',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('manete embreagem yamaha rdz'),
      },
    ],
  },

  // ─── FREIOS ───────────────────────────────────────────────────────────────
  {
    name: 'Flexível do Freio Dianteiro',
    category: 'Freios',
    description: 'Mangueira flexível do freio dianteiro.',
    compatibleParts: [
      {
        name: 'Flexível do freio Tornado 250',
        brand: 'Honda',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('flexível freio dianteiro honda tornado 250'),
      },
      {
        name: 'Flexível de freio universal 96cm',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Pedir em qualquer loja de peças um flexível com 96cm. Os encaixes são padrão.',
        purchaseLink: mlSearch('flexível mangueira freio dianteiro 96cm moto universal'),
      },
    ],
  },
  {
    name: 'Pastilha de Freio Dianteira',
    category: 'Freios',
    description: 'Pastilha do freio dianteiro da Virago 250.',
    compatibleParts: [
      {
        name: 'Pastilha Sundown MAX 125 SED',
        brand: 'Sundown',
        partNumber: 'V032FRD0000-1',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('pastilha freio sundown max 125 V032FRD0000-1'),
      },
      {
        name: 'Pastilha Yamaha RX 180',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('pastilha freio yamaha rx 180'),
      },
      {
        name: 'Pastilha Fisher XV250',
        brand: 'Fisher',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('pastilha freio fisher xv250 virago'),
      },
    ],
  },
  {
    name: 'Reparo da Pinça de Freio Dianteiro',
    category: 'Freios',
    description: 'Kit reparo (vedações) da pinça de freio dianteiro.',
    compatibleParts: [
      {
        name: 'Reparo pinça Tornado 250 (conjunto completo)',
        brand: 'Honda',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'O freio dianteiro completo é o mesmo da Sundown MAX 125 SED.',
        purchaseLink: mlSearch('reparo pinça freio honda tornado 250'),
      },
      {
        name: 'Reparo pinça THL (paralelo)',
        brand: 'THL',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('reparo pinça freio THL virago 250'),
      },
    ],
  },
  {
    name: 'Reparo do Cilindro de Freio',
    category: 'Freios',
    description: 'Kit reparo do cilindro mestre de freio.',
    compatibleParts: [
      {
        name: 'Reparo cilindro freio NX 400 Falcon',
        brand: 'Honda',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'É necessário lixar levemente a borracha do reparo para encaixar corretamente.',
        purchaseLink: mlSearch('reparo cilindro freio honda falcon nx400'),
      },
    ],
  },
  {
    name: 'Lona de Freio Traseiro',
    category: 'Freios',
    description: 'Lona do freio traseiro (freio a tambor).',
    compatibleParts: [
      {
        name: 'Lona de freio YBR 125',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('lona freio yamaha ybr 125'),
      },
      {
        name: 'Lona de freio RD 135',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('lona freio yamaha rd 135'),
      },
      {
        name: 'Lona de freio RX 135',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('lona freio yamaha rx 135'),
      },
    ],
  },

  // ─── CARBURAÇÃO ───────────────────────────────────────────────────────────
  {
    name: 'Borracha de Vedação da Caixa do Filtro de Ar',
    category: 'Carburação',
    description: 'Vedação entre a capa metálica (ovo) e a caixa do filtro de ar.',
    compatibleParts: [
      {
        name: 'Borracha de vedação (metro — casas de borracha)',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Comprar o metro da borracha em casas especializadas de borracha. Cortar no comprimento necessário. Sai por cerca de R$2,00/metro, contra R$18,00 da peça original Yamaha.',
        purchaseLink: mlSearch('borracha vedação perfil p moto filtro ar'),
      },
    ],
  },
  {
    name: 'Agulha do Carburador',
    category: 'Carburação',
    description: 'Agulha de regulagem do ar do carburador.',
    compatibleParts: [
      {
        name: 'Agulha do carburador XT 225',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('agulha carburador yamaha xt 225'),
      },
      {
        name: 'Agulha do carburador YBR',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('agulha carburador yamaha ybr'),
      },
      {
        name: 'Agulha do carburador RD 350',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('agulha carburador yamaha rd350'),
      },
    ],
  },
  {
    name: 'Junta do Carburador',
    category: 'Carburação',
    description: 'Junta de vedação do carburador.',
    compatibleParts: [
      {
        name: 'Junta carburador Mirage 250',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('junta carburador mirage 250'),
      },
      {
        name: 'Junta carburador Drag Star',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('junta carburador yamaha drag star'),
      },
    ],
  },
  {
    name: 'Reparo do Carburador',
    category: 'Carburação',
    description: 'Kit reparo completo do carburador.',
    compatibleParts: [
      {
        name: 'Reparo carburador Siverst',
        brand: 'Siverst',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('reparo carburador siverst virago 250'),
      },
    ],
  },
  {
    name: 'Diafragma do Pistonete (Carburador)',
    category: 'Carburação',
    description: 'Diafragma da válvula de vácuo (pistonete) do carburador.',
    compatibleParts: [
      {
        name: 'Diafragma do carburador XT 225',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('diafragma pistonete carburador yamaha xt225'),
      },
      {
        name: 'Diafragma THL (paralelo)',
        brand: 'THL',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Modelo paralelo específico para Virago da marca THL.',
        purchaseLink: mlSearch('diafragma pistonete carburador virago 250 THL'),
      },
    ],
  },
  {
    name: 'Coletor de Admissão',
    category: 'Carburação',
    description: 'Coletor de admissão (intake) que conecta o carburador ao motor.',
    compatibleParts: [
      {
        name: 'Coletor de admissão DEMTEC (paralelo)',
        brand: 'DEMTEC',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('coletor admissão intake virago 250 demtec'),
      },
      {
        name: 'Coletor de admissão Kansas 250',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('coletor admissão intake kansas 250'),
      },
      {
        name: 'Coletor de admissão V-Blade',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        purchaseLink: mlSearch('coletor admissão intake v-blade 250'),
      },
    ],
  },
  {
    name: 'Filtro de Ar',
    category: 'Carburação',
    description: 'Filtro de ar da Virago 250. Existe paralelo de baixo custo que deve ser trocado mais frequentemente.',
    compatibleParts: [
      {
        name: 'Filtro de ar Ténéré',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('filtro de ar yamaha ténéré'),
      },
      {
        name: 'Filtro de ar XT 600',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('filtro de ar yamaha xt600'),
      },
      {
        name: 'Filtro de ar XV535',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('filtro de ar yamaha xv535'),
      },
      {
        name: 'Filtro paralelo universal (~R$10)',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Filtro paralelo de baixo custo (~R$10). Recomenda-se trocar a cada troca de óleo (não a cada 2 trocas como o original).',
        purchaseLink: mlSearch('filtro ar paralelo virago 250'),
      },
    ],
  },

  // ─── MOTOR ────────────────────────────────────────────────────────────────
  {
    name: 'Disco de Embreagem',
    category: 'Motor',
    description: 'Discos de embreagem. A Virago usa 5 discos; pacotes com 8 rendem 3 de reserva.',
    compatibleParts: [
      {
        name: 'Disco de embreagem Flynn',
        brand: 'Flynn',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Originais têm custo acessível (~R$20 cada).',
        purchaseLink: mlSearch('disco embreagem flynn virago 250'),
      },
      {
        name: 'Disco de embreagem XT 600',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Pacote com 8 discos (~R$70). A Virago usa apenas 5, ficam 3 de reserva.',
        purchaseLink: mlSearch('disco embreagem yamaha xt600'),
      },
      {
        name: 'Disco de embreagem DT 180',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Verificar compatibilidade exata antes de instalar.',
        purchaseLink: mlSearch('disco embreagem yamaha dt 180'),
      },
    ],
  },
  {
    name: 'Válvulas e Retentores de Válvulas',
    category: 'Motor',
    description: 'Válvulas de admissão/escape e retentores de válvulas.',
    compatibleParts: [
      {
        name: 'Válvulas e retentores YBR',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('válvula retentor motor yamaha ybr'),
      },
    ],
  },
  {
    name: 'Pistão e Anéis',
    category: 'Motor',
    description: 'Pistão e anéis para retífica do motor.',
    compatibleParts: [
      {
        name: 'Pistão Biz 100 Standard (para retífica 0,25)',
        brand: 'Honda',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Para retífica de 0,25mm: usar o pistão STANDARD da Biz 100.',
        notes: 'Retífica 0,25 → pistão Standard da Biz 100.',
        purchaseLink: mlSearch('pistão anéis honda biz 100 standard'),
      },
      {
        name: 'Pistão Biz 100 0,25 (para retífica 0,50)',
        brand: 'Honda',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Para retífica de 0,50mm: usar o pistão 0,25 da Biz 100.',
        notes: 'Retífica 0,50 → pistão 0,25 da Biz 100.',
        purchaseLink: mlSearch('pistão anéis honda biz 100 0.25'),
      },
    ],
  },
  {
    name: 'Corrente de Comando',
    category: 'Motor',
    description: 'Corrente de comando do motor (corrente da árvore de cames).',
    compatibleParts: [
      {
        name: 'Corrente de comando Biz 100 (3 correntes fazem 2 Virago)',
        brand: 'Honda',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Comprar 3 correntes de Biz 100 para fazer 2 correntes de Virago. Este modelo pode ser emendado sem risco de escapar, desde que o arrebite seja bem feito.',
        purchaseLink: mlSearch('corrente comando honda biz 100'),
      },
    ],
  },
  {
    name: 'Tensionador da Corrente de Comando',
    category: 'Motor',
    description: 'Tensionador automático da corrente de comando.',
    compatibleParts: [
      {
        name: 'Tensionador da corrente de comando YBR',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('tensionador corrente comando yamaha ybr'),
      },
    ],
  },
  {
    name: 'Vela de Ignição',
    category: 'Motor',
    description: 'Vela de ignição da Virago 250. Referência original: SR6HS.',
    compatibleParts: [
      {
        name: 'Vela NGK SR6HS (original)',
        brand: 'NGK',
        partNumber: 'SR6HS',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('vela NGK SR6HS'),
      },
      {
        name: 'Vela Biz C6HSA (não resistiva)',
        brand: 'NGK',
        partNumber: 'C6HSA',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Funciona, mas pode gerar interferência elétrica. Prefira a versão resistiva.',
        purchaseLink: mlSearch('vela NGK C6HSA biz'),
      },
      {
        name: 'Vela Bosch U5AC (resistiva)',
        brand: 'Bosch',
        partNumber: 'U5AC',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Versão resistiva — recomendada por não gerar interferência.',
        purchaseLink: mlSearch('vela bosch U5AC moto'),
      },
      {
        name: 'Vela NGK Iridium CR6HIX',
        brand: 'NGK',
        partNumber: 'CR6HIX',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Vela de alto desempenho com eletrodo de Iridium.',
        purchaseLink: mlSearch('vela NGK iridium CR6HIX'),
      },
    ],
  },
  {
    name: 'Cachimbo de Vela (Terminal Supressivo)',
    category: 'Motor',
    description: 'Cachimbo (capuchão) da vela de ignição com supressor de interferência.',
    compatibleParts: [
      {
        name: 'Cachimbo Dafra Kansas 150',
        brand: 'Dafra',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('cachimbo vela dafra kansas 150'),
      },
      {
        name: 'Cachimbo CG 150',
        brand: 'Honda',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('cachimbo vela honda cg 150'),
      },
      {
        name: 'Cachimbo Titan 150',
        brand: 'Honda',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('cachimbo vela honda titan 150'),
      },
    ],
  },

  // ─── TRANSMISSÃO ──────────────────────────────────────────────────────────
  {
    name: 'Coroa Traseira',
    category: 'Transmissão',
    description: 'Coroa traseira da relação de transmissão. Original: 45 dentes.',
    compatibleParts: [
      {
        name: 'Coroa Ténéré 40 dentes',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Testada e aprovada. Aumenta a velocidade final mas diminui a arrancada.',
        purchaseLink: mlSearch('coroa ténéré 40 dentes'),
      },
      {
        name: 'Coroa XT 600 / Ténéré 45 dentes',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Coroa de 45 dentes — relação próxima à original.',
        purchaseLink: mlSearch('coroa xt600 ténéré 45 dentes'),
      },
    ],
  },
  {
    name: 'Pinhão',
    category: 'Transmissão',
    description: 'Pinhão dianteiro da relação. Original: 16 dentes.',
    compatibleParts: [
      {
        name: 'Pinhão RD 350 — 15 dentes',
        brand: 'Yamaha',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Com coroa Ténéré 40 dentes: relação 2,66 (pouco mais longa que a original). Considerada a melhor combinação pela comunidade. É necessário furar e fazer rosca para a trava do pinhão.',
        notes: 'Com coroa 40 (Ténéré) → relação 2,66. Altamente recomendado.',
        purchaseLink: mlSearch('pinhão yamaha rd 350 15 dentes'),
      },
      {
        name: 'Pinhão XL 250 — 14 dentes',
        brand: 'Honda',
        compatibilityLevel: 'ADAPTACAO_SIMPLES',
        adaptationText: 'Com coroa Ténéré 40 dentes: relação 2,85 — praticamente igual à original. Não há diferença palpável.',
        notes: 'Com coroa 40 (Ténéré) → relação 2,85. Similar à original.',
        purchaseLink: mlSearch('pinhão honda xl 250 14 dentes'),
      },
    ],
  },
  {
    name: 'Corrente de Transmissão',
    category: 'Transmissão',
    description: 'Corrente de transmissão. Especificação: passo 520, 114 elos.',
    compatibleParts: [
      {
        name: 'Corrente CB 400/450 — passo 520, 114 elos',
        brand: 'Honda',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Passo 520 com 114 elos. Prefira corrente com retentor (borracha entre os elos) — não trepida e não faz barulho. Melhor marca: DID.',
        purchaseLink: mlSearch('corrente transmissão 520 114 elos honda cb450'),
      },
      {
        name: 'Corrente DID passo 520',
        brand: 'DID',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Melhor marca para corrente com retentor. Pode usar a do Ténéré.',
        purchaseLink: mlSearch('corrente DID 520 moto com retentor'),
      },
    ],
  },
  {
    name: 'Retentor do Pinhão',
    category: 'Transmissão',
    description: 'Retentor (oil seal) do pinhão dianteiro.',
    compatibleParts: [
      {
        name: 'Retentor código 01397BA',
        partNumber: '01397BA',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Procurar pelo código 01397BA em casas especializadas em retentores.',
        purchaseLink: mlSearch('retentor 01397BA pinhão moto'),
      },
    ],
  },

  // ─── ACESSÓRIOS ───────────────────────────────────────────────────────────
  {
    name: 'Descanso Lateral',
    category: 'Acessórios',
    description: 'Cavalete lateral (descanso lateral).',
    compatibleParts: [
      {
        name: 'Descanso lateral YBR (com mola)',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Testado e aprovado. Preço acessível (~R$19 com mola inclusa).',
        purchaseLink: mlSearch('descanso lateral yamaha ybr com mola'),
      },
    ],
  },
  {
    name: 'Bucha do Escapamento',
    category: 'Acessórios',
    description: 'Bucha (gaxeta) de vedação do escapamento na saída do motor.',
    compatibleParts: [
      {
        name: 'Gaxeta do escapamento XTZ',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        purchaseLink: mlSearch('gaxeta bucha escapamento yamaha xtz'),
      },
      {
        name: 'Graxeta tubo escape Bis / Crypton',
        brand: 'Yamaha',
        compatibilityLevel: 'ENCAIXE_PERFEITO',
        notes: 'Arruela/anel que vai entre o escape e a saída da tubagem.',
        purchaseLink: mlSearch('arruela anel escape yamaha biz crypton'),
      },
    ],
  },
]

async function main() {
  console.log('🏍️  Iniciando seed de peças compatíveis da Virago 250...\n')
  let totalParts = 0
  let totalCompatible = 0
  let skipped = 0

  for (const partData of PARTS) {
    // Verifica se a peça já existe (evita duplicatas)
    const existing = await prisma.part.findFirst({
      where: { name: partData.name },
    })

    if (existing) {
      console.log(`⏭️  Já existe: ${partData.name}`)
      skipped++
      continue
    }

    const part = await prisma.part.create({
      data: {
        name: partData.name,
        category: partData.category,
        description: partData.description,
        compatibleParts: {
          create: partData.compatibleParts.map(cp => ({
            name: cp.name,
            brand: cp.brand,
            partNumber: cp.partNumber,
            compatibilityLevel: cp.compatibilityLevel,
            adaptationText: cp.adaptationText,
            notes: cp.notes,
            purchaseLink: cp.purchaseLink,
          })),
        },
      },
      include: { compatibleParts: true },
    })

    console.log(`✅ ${part.name} (${part.category}) — ${part.compatibleParts.length} compatível(is)`)
    totalParts++
    totalCompatible += part.compatibleParts.length
  }

  console.log(`\n📊 Resumo:`)
  console.log(`   Peças criadas:       ${totalParts}`)
  console.log(`   Peças compatíveis:   ${totalCompatible}`)
  console.log(`   Já existiam:         ${skipped}`)
  console.log(`\n✅ Seed concluído!`)
}

main()
  .catch(e => { console.error('❌ Erro:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
