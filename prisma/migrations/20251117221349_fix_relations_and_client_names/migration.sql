-- AlterTable
ALTER TABLE "pago" ADD COLUMN     "id_metodo" INTEGER;

-- AlterTable
ALTER TABLE "reserva" ADD COLUMN     "id_detalle_reserva" INTEGER;

-- CreateTable
CREATE TABLE "metodo_pago" (
    "id_metodo" SERIAL NOT NULL,
    "nombre_metodo" VARCHAR(100),
    "n_recibo_efectivo" INTEGER,
    "url_comprobante_transferencia" VARCHAR(255),
    "rut_emisor" VARCHAR(20),
    "banco_emisor" VARCHAR(100),
    "tipo_cuenta" VARCHAR(50),
    "num_cuenta" VARCHAR(50),
    "num_transaccion_externa" VARCHAR(100),

    CONSTRAINT "metodo_pago_pkey" PRIMARY KEY ("id_metodo")
);

-- CreateTable
CREATE TABLE "detalle_reserva" (
    "id_detalle_reserva" SERIAL NOT NULL,
    "nombre_servicio" VARCHAR(255),
    "precio_servicio" DECIMAL(10,2),
    "tipo_servicio" VARCHAR(100),
    "desc_servicio" VARCHAR(500),
    "cantidad" INTEGER,
    "precio_total" DECIMAL(10,2),
    "cod_producto" INTEGER,

    CONSTRAINT "detalle_reserva_pkey" PRIMARY KEY ("id_detalle_reserva")
);

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_metodo_fkey" FOREIGN KEY ("id_metodo") REFERENCES "metodo_pago"("id_metodo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_detalle_reserva_fkey" FOREIGN KEY ("id_detalle_reserva") REFERENCES "detalle_reserva"("id_detalle_reserva") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_reserva" ADD CONSTRAINT "detalle_reserva_cod_producto_fkey" FOREIGN KEY ("cod_producto") REFERENCES "producto"("cod_producto") ON DELETE NO ACTION ON UPDATE NO ACTION;
