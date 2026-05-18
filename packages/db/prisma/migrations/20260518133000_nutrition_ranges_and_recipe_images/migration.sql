-- AlterTable
ALTER TABLE "Recipe"
ADD COLUMN "totalCaloriesMin" DOUBLE PRECISION,
ADD COLUMN "totalCaloriesMax" DOUBLE PRECISION,
ADD COLUMN "totalProteinsMin" DOUBLE PRECISION,
ADD COLUMN "totalProteinsMax" DOUBLE PRECISION,
ADD COLUMN "totalCarbsMin" DOUBLE PRECISION,
ADD COLUMN "totalCarbsMax" DOUBLE PRECISION,
ADD COLUMN "totalSugarsMin" DOUBLE PRECISION,
ADD COLUMN "totalSugarsMax" DOUBLE PRECISION,
ADD COLUMN "totalFatsMin" DOUBLE PRECISION,
ADD COLUMN "totalFatsMax" DOUBLE PRECISION,
ADD COLUMN "totalFiberMin" DOUBLE PRECISION,
ADD COLUMN "totalFiberMax" DOUBLE PRECISION,
ADD COLUMN "totalSaltMin" DOUBLE PRECISION,
ADD COLUMN "totalSaltMax" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Ingredient"
ADD COLUMN "sourceName" TEXT,
ADD COLUMN "caloriesMin" DOUBLE PRECISION,
ADD COLUMN "caloriesMax" DOUBLE PRECISION,
ADD COLUMN "proteinsMin" DOUBLE PRECISION,
ADD COLUMN "proteinsMax" DOUBLE PRECISION,
ADD COLUMN "carbsMin" DOUBLE PRECISION,
ADD COLUMN "carbsMax" DOUBLE PRECISION,
ADD COLUMN "sugarsMin" DOUBLE PRECISION,
ADD COLUMN "sugarsMax" DOUBLE PRECISION,
ADD COLUMN "fatsMin" DOUBLE PRECISION,
ADD COLUMN "fatsMax" DOUBLE PRECISION,
ADD COLUMN "fiberMin" DOUBLE PRECISION,
ADD COLUMN "fiberMax" DOUBLE PRECISION,
ADD COLUMN "saltMin" DOUBLE PRECISION,
ADD COLUMN "saltMax" DOUBLE PRECISION;

UPDATE "Ingredient"
SET
  "caloriesMin" = CASE WHEN "calories" IS NULL THEN NULL ELSE GREATEST(0, ROUND(("calories" * 0.95)::numeric, 2)::double precision) END,
  "caloriesMax" = CASE WHEN "calories" IS NULL THEN NULL ELSE ROUND(("calories" * 1.05)::numeric, 2)::double precision END,
  "proteinsMin" = CASE WHEN "proteins" IS NULL THEN NULL ELSE GREATEST(0, ROUND(("proteins" * 0.95)::numeric, 2)::double precision) END,
  "proteinsMax" = CASE WHEN "proteins" IS NULL THEN NULL ELSE ROUND(("proteins" * 1.05)::numeric, 2)::double precision END,
  "carbsMin" = CASE WHEN "carbs" IS NULL THEN NULL ELSE GREATEST(0, ROUND(("carbs" * 0.95)::numeric, 2)::double precision) END,
  "carbsMax" = CASE WHEN "carbs" IS NULL THEN NULL ELSE ROUND(("carbs" * 1.05)::numeric, 2)::double precision END,
  "fatsMin" = CASE WHEN "fats" IS NULL THEN NULL ELSE GREATEST(0, ROUND(("fats" * 0.95)::numeric, 2)::double precision) END,
  "fatsMax" = CASE WHEN "fats" IS NULL THEN NULL ELSE ROUND(("fats" * 1.05)::numeric, 2)::double precision END;

UPDATE "Recipe"
SET
  "totalCaloriesMin" = CASE WHEN "totalCalories" IS NULL THEN NULL ELSE GREATEST(0, ROUND(("totalCalories" * 0.95)::numeric, 2)::double precision) END,
  "totalCaloriesMax" = CASE WHEN "totalCalories" IS NULL THEN NULL ELSE ROUND(("totalCalories" * 1.05)::numeric, 2)::double precision END,
  "totalProteinsMin" = CASE WHEN "totalProteins" IS NULL THEN NULL ELSE GREATEST(0, ROUND(("totalProteins" * 0.95)::numeric, 2)::double precision) END,
  "totalProteinsMax" = CASE WHEN "totalProteins" IS NULL THEN NULL ELSE ROUND(("totalProteins" * 1.05)::numeric, 2)::double precision END,
  "totalCarbsMin" = CASE WHEN "totalCarbs" IS NULL THEN NULL ELSE GREATEST(0, ROUND(("totalCarbs" * 0.95)::numeric, 2)::double precision) END,
  "totalCarbsMax" = CASE WHEN "totalCarbs" IS NULL THEN NULL ELSE ROUND(("totalCarbs" * 1.05)::numeric, 2)::double precision END,
  "totalFatsMin" = CASE WHEN "totalFats" IS NULL THEN NULL ELSE GREATEST(0, ROUND(("totalFats" * 0.95)::numeric, 2)::double precision) END,
  "totalFatsMax" = CASE WHEN "totalFats" IS NULL THEN NULL ELSE ROUND(("totalFats" * 1.05)::numeric, 2)::double precision END;
