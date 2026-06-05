CREATE TABLE "purchase_links" (
    "id" TEXT NOT NULL,
    "compatiblePartId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'other',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchase_links_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "purchase_links_compatiblePartId_fkey"
        FOREIGN KEY ("compatiblePartId")
        REFERENCES "compatible_parts"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);
