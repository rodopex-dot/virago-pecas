import { PrismaClient, CompatibilityLevel } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.videoReference.deleteMany()
  await prisma.compatiblePart.deleteMany()
  await prisma.part.deleteMany()
  await prisma.suggestion.deleteMany()

  const amortecedor = await prisma.part.create({
    data: {
      name: 'Amortecedor Traseiro',
      description: 'Amortecedor original traseiro da Yamaha Virago 250',
      category: 'Suspensão',
      compatibleParts: {
        create: [
          {
            name: 'Amortecedor Showa 330mm Universal',
            brand: 'Showa',
            partNumber: 'SHW-330-U',
            price: 189.90,
            purchaseLink: 'https://www.mercadolivre.com.br',
            compatibilityLevel: CompatibilityLevel.ENCAIXE_PERFEITO,
            notes: 'Medida idêntica ao original. Fixação nos mesmos pontos.',
          },
          {
            name: 'Amortecedor Cofap 300mm',
            brand: 'Cofap',
            partNumber: 'CF-300',
            price: 129.90,
            purchaseLink: 'https://www.shopee.com.br',
            compatibilityLevel: CompatibilityLevel.ADAPTACAO_SIMPLES,
            adaptationText: 'O amortecedor Cofap 300mm é 30mm mais curto que o original. Para a adaptação, utilize buchas espaçadoras de 15mm em cada extremidade de fixação. As buchas podem ser encontradas em lojas de rolamentos ou torneadas por um profissional. O procedimento não exige solda e pode ser feito em casa com ferramentas básicas.',
            videos: {
              create: [
                {
                  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  platform: 'youtube',
                  title: 'Como adaptar amortecedor Cofap na Virago 250',
                },
              ],
            },
          },
          {
            name: 'Amortecedor de Titan 125 2000-2005',
            brand: 'Honda OEM',
            price: 89.90,
            purchaseLink: 'https://www.olx.com.br',
            compatibilityLevel: CompatibilityLevel.ADAPTACAO_COMPLEXA,
            adaptationText: 'O amortecedor da Titan 125 (modelo 2000-2005) pode ser utilizado, porém exige adaptação complexa: as olhais de fixação possuem diâmetros diferentes e será necessário soldar adaptadores nos pontos de encaixe. Recomenda-se levar a moto a uma funilaria/serralheria de confiança. Procedimento não recomendado para iniciantes.',
            videos: {
              create: [
                {
                  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  platform: 'youtube',
                  title: 'Adaptação amortecedor Titan na Virago - Processo completo',
                },
                {
                  url: 'https://www.instagram.com/reel/example',
                  platform: 'instagram',
                  title: 'Resultado final da adaptação',
                },
              ],
            },
          },
        ],
      },
    },
  })

  const pastilha = await prisma.part.create({
    data: {
      name: 'Pastilha de Freio Dianteira',
      description: 'Pastilha de freio dianteira original da Yamaha Virago 250',
      category: 'Freios',
      compatibleParts: {
        create: [
          {
            name: 'Pastilha EBC FA54',
            brand: 'EBC Brakes',
            partNumber: 'FA54',
            price: 85.00,
            purchaseLink: 'https://www.amazon.com.br',
            compatibilityLevel: CompatibilityLevel.ENCAIXE_PERFEITO,
            notes: 'Substituto direto. Alta performance. Encaixe exato na pinça original.',
          },
          {
            name: 'Pastilha Cobreq N-1012',
            brand: 'Cobreq',
            partNumber: 'N-1012',
            price: 38.90,
            purchaseLink: 'https://www.mercadolivre.com.br',
            compatibilityLevel: CompatibilityLevel.ADAPTACAO_SIMPLES,
            adaptationText: 'A pastilha Cobreq N-1012 é compatível mas tem espessura 1,5mm maior. Antes de instalar, lixe levemente as laterais da pastilha com lixa 120 até ela deslizar suavemente no suporte. O processo leva cerca de 15 minutos e não exige ferramentas especiais.',
            videos: {
              create: [
                {
                  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  platform: 'youtube',
                  title: 'Adaptando pastilha Cobreq na Virago 250',
                },
              ],
            },
          },
        ],
      },
    },
  })

  const filtroAr = await prisma.part.create({
    data: {
      name: 'Filtro de Ar',
      description: 'Filtro de ar original do carburador da Yamaha Virago 250',
      category: 'Motor',
      compatibleParts: {
        create: [
          {
            name: 'Filtro K&N YA-2501',
            brand: 'K&N',
            partNumber: 'YA-2501',
            price: 220.00,
            purchaseLink: 'https://www.amazon.com.br',
            compatibilityLevel: CompatibilityLevel.ENCAIXE_PERFEITO,
            notes: 'Filtro lavável e reutilizável. Encaixe direto. Melhora a performance do motor.',
          },
        ],
      },
    },
  })

  console.log('Seed concluído com sucesso!')
  console.log(`Peças criadas: ${[amortecedor, pastilha, filtroAr].map(p => p.name).join(', ')}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
