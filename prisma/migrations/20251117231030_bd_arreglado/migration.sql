/*
  Warnings:

  - You are about to alter the column `precio_total` on the `reserva` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "reserva" ALTER COLUMN "precio_total" DROP DEFAULT,
ALTER COLUMN "precio_total" SET DATA TYPE DECIMAL(10,2);
