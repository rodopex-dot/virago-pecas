-- Make purchaseLink optional (nullable)
ALTER TABLE "compatible_parts" ALTER COLUMN "purchaseLink" DROP NOT NULL;
