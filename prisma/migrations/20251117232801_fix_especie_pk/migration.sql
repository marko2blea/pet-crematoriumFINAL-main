/*
  Warnings:

  - You are about to drop the `especie` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "mascota" DROP CONSTRAINT "mascota_id_especie_fkey";

-- DropTable
DROP TABLE "especie";

-- CreateTable
CREATE TABLE "Especie" (
    "id_especie" SERIAL NOT NULL,
    "tipo_mascota" TEXT,
    "nombre_especie" TEXT,
    "raza" TEXT,

    CONSTRAINT "Especie_pkey" PRIMARY KEY ("id_especie")
);

-- AddForeignKey
ALTER TABLE "mascota" ADD CONSTRAINT "mascota_id_especie_fkey" FOREIGN KEY ("id_especie") REFERENCES "Especie"("id_especie") ON DELETE NO ACTION ON UPDATE NO ACTION;
