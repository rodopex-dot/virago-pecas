-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- Seed default categories
INSERT INTO "categories" ("id", "name", "description", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'Freios',     'Discos, pastilhas, pinças',      NOW(), NOW()),
  (gen_random_uuid()::text, 'Motor',      'Pistão, carburador, velas',      NOW(), NOW()),
  (gen_random_uuid()::text, 'Suspensão',  'Garfo, amortecedor, molas',      NOW(), NOW()),
  (gen_random_uuid()::text, 'Carenagem',  'Rabeta, tanque, plásticos',      NOW(), NOW()),
  (gen_random_uuid()::text, 'Cabos',      'Acelerador, embreagem, freio',   NOW(), NOW()),
  (gen_random_uuid()::text, 'Acessórios', 'Retrovisores, manoplas, farol',  NOW(), NOW()),
  (gen_random_uuid()::text, 'Elétrica',   'Regulador, bobina, chicote',     NOW(), NOW()),
  (gen_random_uuid()::text, 'Transmissão','Corrente, pinhão, coroa',        NOW(), NOW()),
  (gen_random_uuid()::text, 'Carburação', 'Carburador, filtro, bico',       NOW(), NOW()),
  (gen_random_uuid()::text, 'Geral',      'Outros componentes',             NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
