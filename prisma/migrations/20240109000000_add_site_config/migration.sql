CREATE TABLE "site_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_configs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "site_configs_key_key" ON "site_configs"("key");

INSERT INTO "site_configs" ("id", "key", "updatedAt") VALUES
  (gen_random_uuid()::text, 'adsense_publisher_id', NOW())
ON CONFLICT ("key") DO NOTHING;
