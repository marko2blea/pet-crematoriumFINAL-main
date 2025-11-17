/*
  Warnings:

  - Added the required column `precio_total` to the `reserva` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reserva" ADD COLUMN "precio_total" DECIMAL DEFAULT 0 NOT NULL;
