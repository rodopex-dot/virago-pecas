-- CreateTable
CREATE TABLE "ad_spaces" (
    "id" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "adCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ad_spaces_slot_key" ON "ad_spaces"("slot");

-- Seed: espaços padrão (criados apenas se não existirem)
INSERT INTO "ad_spaces" ("id", "slot", "label", "description", "active", "updatedAt") VALUES
  ('adspace_top',     'top',     'Banner Topo',              'Exibido no topo de todas as páginas. Tamanho recomendado: 728×90 (Leaderboard).', false, NOW()),
  ('adspace_sidebar', 'sidebar', 'Banner Lateral',           'Exibido na coluna direita. Tamanho recomendado: 300×250 (Medium Rectangle).', false, NOW()),
  ('adspace_inline',  'inline',  'Banner Entre Resultados',  'Exibido entre os itens da lista de peças. Tamanho recomendado: 468×60 (Banner).', false, NOW())
ON CONFLICT ("slot") DO NOTHING;
