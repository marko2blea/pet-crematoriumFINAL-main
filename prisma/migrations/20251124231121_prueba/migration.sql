-- AlterTable
ALTER TABLE "reserva" ADD COLUMN     "id_mascota" INTEGER;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_mascota_fkey" FOREIGN KEY ("id_mascota") REFERENCES "mascota"("id_mascota") ON DELETE SET NULL ON UPDATE CASCADE;
