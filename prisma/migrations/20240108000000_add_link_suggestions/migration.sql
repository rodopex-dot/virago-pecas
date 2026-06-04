-- CreateTable
CREATE TABLE "link_suggestions" (
    "id" TEXT NOT NULL,
    "compatiblePartId" TEXT NOT NULL,
    "purchaseLink" TEXT,
    "videoLinks" TEXT,
    "submitterEmail" TEXT,
    "notes" TEXT,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "link_suggestions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "link_suggestions" ADD CONSTRAINT "link_suggestions_compatiblePartId_fkey"
  FOREIGN KEY ("compatiblePartId") REFERENCES "compatible_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
