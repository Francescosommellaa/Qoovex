-- CreateEnum
CREATE TYPE "RecipeCategory" AS ENUM ('ANTIPASTO', 'PRIMO', 'SECONDO', 'CONTORNO', 'DOLCE', 'PANE_LIEVITATI', 'SALSA_BASE', 'BEVANDA', 'ALTRO');

-- CreateEnum
CREATE TYPE "RecipeStatus" AS ENUM ('DRAFT', 'READY', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IngredientVerificationStatus" AS ENUM ('VERIFIED', 'SUGGESTED', 'PENDING_REVIEW', 'REJECTED');

-- CreateEnum
CREATE TYPE "IngredientSource" AS ENUM ('USER', 'QOOVEX', 'OPEN_FOOD_FACTS', 'USDA', 'OLLAMA');

-- AlterTable
ALTER TABLE "Recipe"
ADD COLUMN "category" "RecipeCategory" NOT NULL DEFAULT 'ALTRO',
ADD COLUMN "status" "RecipeStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "totalCalories" DOUBLE PRECISION,
ADD COLUMN "totalProteins" DOUBLE PRECISION,
ADD COLUMN "totalCarbs" DOUBLE PRECISION,
ADD COLUMN "totalFats" DOUBLE PRECISION,
ADD COLUMN "deletedAt" TIMESTAMP(3);

UPDATE "Recipe"
SET "status" = CASE WHEN "isPublic" THEN 'PUBLISHED'::"RecipeStatus" ELSE 'READY'::"RecipeStatus" END
WHERE "deletedAt" IS NULL;

-- AlterTable
ALTER TABLE "Ingredient"
ADD COLUMN "slug" TEXT,
ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "source" "IngredientSource" NOT NULL DEFAULT 'USER',
ADD COLUMN "sourceRef" TEXT,
ADD COLUMN "confidence" DOUBLE PRECISION,
ADD COLUMN "verificationStatus" "IngredientVerificationStatus" NOT NULL DEFAULT 'VERIFIED',
ADD COLUMN "sourceUpdatedAt" TIMESTAMP(3),
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

WITH normalized AS (
  SELECT
    "id",
    NULLIF(
      trim(both '-' from regexp_replace(lower("name"), '[^a-z0-9]+', '-', 'g')),
      ''
    ) AS "baseSlug"
  FROM "Ingredient"
),
numbered AS (
  SELECT
    "id",
    COALESCE("baseSlug", 'ingrediente') AS "baseSlug",
    row_number() OVER (PARTITION BY COALESCE("baseSlug", 'ingrediente') ORDER BY "id") AS "position"
  FROM normalized
)
UPDATE "Ingredient"
SET "slug" = CASE
  WHEN numbered."position" = 1 THEN numbered."baseSlug"
  ELSE numbered."baseSlug" || '-' || numbered."position"
END
FROM numbered
WHERE "Ingredient"."id" = numbered."id";

ALTER TABLE "Ingredient" ALTER COLUMN "slug" SET NOT NULL;

-- CreateTable
CREATE TABLE "IngredientReview" (
  "id" TEXT NOT NULL,
  "ingredientId" TEXT,
  "recipeId" TEXT,
  "userId" TEXT NOT NULL,
  "rawName" TEXT NOT NULL,
  "normalizedSlug" TEXT NOT NULL,
  "status" "IngredientVerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
  "note" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "IngredientReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recipe_authorId_deletedAt_updatedAt_idx" ON "Recipe"("authorId", "deletedAt", "updatedAt");

-- CreateIndex
CREATE INDEX "Recipe_authorId_category_status_idx" ON "Recipe"("authorId", "category", "status");

-- CreateIndex
CREATE INDEX "Recipe_isPublic_status_updatedAt_idx" ON "Recipe"("isPublic", "status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Ingredient_slug_key" ON "Ingredient"("slug");

-- CreateIndex
CREATE INDEX "Ingredient_slug_idx" ON "Ingredient"("slug");

-- CreateIndex
CREATE INDEX "Ingredient_verificationStatus_updatedAt_idx" ON "Ingredient"("verificationStatus", "updatedAt");

-- CreateIndex
CREATE INDEX "IngredientReview_status_createdAt_idx" ON "IngredientReview"("status", "createdAt");

-- CreateIndex
CREATE INDEX "IngredientReview_userId_createdAt_idx" ON "IngredientReview"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientReview_normalizedSlug_userId_status_key" ON "IngredientReview"("normalizedSlug", "userId", "status");

-- AddForeignKey
ALTER TABLE "IngredientReview" ADD CONSTRAINT "IngredientReview_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientReview" ADD CONSTRAINT "IngredientReview_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientReview" ADD CONSTRAINT "IngredientReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
