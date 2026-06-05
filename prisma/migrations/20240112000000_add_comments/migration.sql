CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "compatiblePartId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "comments_compatiblePartId_fkey"
        FOREIGN KEY ("compatiblePartId")
        REFERENCES "compatible_parts"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);
