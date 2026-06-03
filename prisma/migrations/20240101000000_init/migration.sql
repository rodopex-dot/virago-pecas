-- CreateEnum
CREATE TYPE "CompatibilityLevel" AS ENUM ('ENCAIXE_PERFEITO', 'ADAPTACAO_SIMPLES', 'ADAPTACAO_COMPLEXA');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compatible_parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "partNumber" TEXT,
    "price" DOUBLE PRECISION,
    "purchaseLink" TEXT NOT NULL,
    "compatibilityLevel" "CompatibilityLevel" NOT NULL,
    "adaptationText" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "partId" TEXT NOT NULL,

    CONSTRAINT "compatible_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_references" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "title" TEXT,
    "compatiblePartId" TEXT NOT NULL,

    CONSTRAINT "video_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "compatiblePartName" TEXT NOT NULL,
    "brand" TEXT,
    "purchaseLink" TEXT NOT NULL,
    "compatibilityLevel" "CompatibilityLevel" NOT NULL,
    "adaptationText" TEXT,
    "videoLinks" TEXT,
    "submitterEmail" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "compatible_parts" ADD CONSTRAINT "compatible_parts_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_references" ADD CONSTRAINT "video_references_compatiblePartId_fkey" FOREIGN KEY ("compatiblePartId") REFERENCES "compatible_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
