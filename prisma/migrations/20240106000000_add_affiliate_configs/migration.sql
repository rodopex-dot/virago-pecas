-- CreateTable
CREATE TABLE "affiliate_configs" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_configs_platform_key" ON "affiliate_configs"("platform");

-- Seed das plataformas suportadas
INSERT INTO "affiliate_configs" ("id", "platform", "active", "createdAt", "updatedAt") VALUES
  (gen_random_uuid()::text, 'amazon',        false, NOW(), NOW()),
  (gen_random_uuid()::text, 'mercadolivre',  false, NOW(), NOW()),
  (gen_random_uuid()::text, 'shopee',        false, NOW(), NOW()),
  (gen_random_uuid()::text, 'aliexpress',    false, NOW(), NOW()),
  (gen_random_uuid()::text, 'magalu',        false, NOW(), NOW())
ON CONFLICT (platform) DO NOTHING;
