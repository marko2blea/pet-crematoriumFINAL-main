-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "apellido_paterno" VARCHAR(100),
    "apellido_materno" VARCHAR(100),
    "fecha_nacimiento" DATE,
    "correo" VARCHAR(255),
    "contraseña" VARCHAR(255),
    "telefono" INTEGER,
    "fecha_registro" DATE,
    "region" VARCHAR(100),
    "comuna" VARCHAR(100),
    "direccion" VARCHAR(255),
    "id_rol" INTEGER,
    "reset_token" VARCHAR(255),
    "reset_token_expires" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "rol" (
    "id_rol" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(100),
    "descripcion_rol" VARCHAR(255),

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "producto" (
    "cod_producto" SERIAL NOT NULL,
    "nombre_producto" VARCHAR(255),
    "stock_actual" INTEGER,
    "precio_unitario" DECIMAL(10,2),
    "disponible" BOOLEAN,
    "tipo_producto" VARCHAR(100),
    "id_proveedor" INTEGER,
    "descripcion" TEXT,
    "imagen_url" VARCHAR(500),

    CONSTRAINT "producto_pkey" PRIMARY KEY ("cod_producto")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id_pedido" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_pago" INTEGER,
    "fecha_pedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "precio_total" DECIMAL(10,2) NOT NULL,
    "estado_pedido" TEXT NOT NULL DEFAULT 'Pendiente',
    "es_reserva" BOOLEAN NOT NULL,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "detalle_pedido" (
    "id_detalle_pedido" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "cod_producto" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "detalle_pedido_pkey" PRIMARY KEY ("id_detalle_pedido")
);

-- CreateTable
CREATE TABLE "pago" (
    "id_pago" SERIAL NOT NULL,
    "nombre_metodo" VARCHAR(100),
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(10,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'Pendiente',

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id_pago")
);

-- CreateTable
CREATE TABLE "reserva" (
    "id_reserva" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "cod_trazabilidad" CHAR(9) NOT NULL,
    "fecha_reservada" TIMESTAMP(3),
    "hora_reservada" TIMESTAMP(3),
    "estado_reserva" TEXT NOT NULL DEFAULT 'Pendiente',
    "region" VARCHAR(100),
    "comuna" VARCHAR(100),
    "direccion" VARCHAR(255),

    CONSTRAINT "reserva_pkey" PRIMARY KEY ("id_reserva")
);

-- CreateTable
CREATE TABLE "envio" (
    "id_envio" SERIAL NOT NULL,
    "id_pedido" INTEGER NOT NULL,
    "region_envio" TEXT NOT NULL,
    "comuna_envio" TEXT NOT NULL,
    "direccion_envio" TEXT NOT NULL,
    "estado_envio" TEXT NOT NULL DEFAULT 'Pendiente',

    CONSTRAINT "envio_pkey" PRIMARY KEY ("id_envio")
);

-- CreateTable
CREATE TABLE "mascota" (
    "id_mascota" SERIAL NOT NULL,
    "nombre_mascota" VARCHAR(100),
    "peso" DECIMAL(5,2),
    "edad" INTEGER,
    "diagnostico_sanitario" VARCHAR(500),
    "notas_manipulacion" VARCHAR(500),
    "id_especie" INTEGER,
    "id_usuario" INTEGER,

    CONSTRAINT "mascota_pkey" PRIMARY KEY ("id_mascota")
);

-- CreateTable
CREATE TABLE "especie" (
    "id_especie" SERIAL NOT NULL,
    "tipo_mascota" VARCHAR(100),
    "nombre_especie" VARCHAR(100),
    "raza" VARCHAR(100),

    CONSTRAINT "especie_pkey" PRIMARY KEY ("id_especie")
);

-- CreateTable
CREATE TABLE "proveedor" (
    "id_proveedor" SERIAL NOT NULL,
    "proveedor" VARCHAR(255),
    "contacto" INTEGER,
    "region" VARCHAR(100),
    "comuna" VARCHAR(100),
    "direccion" VARCHAR(255),
    "disponible" BOOLEAN,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("id_proveedor")
);

-- CreateTable
CREATE TABLE "valoracion" (
    "id_valoracion" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comentario" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_producto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "valoracion_pkey" PRIMARY KEY ("id_valoracion")
);

-- CreateTable
CREATE TABLE "page_content" (
    "page_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,

    CONSTRAINT "page_content_pkey" PRIMARY KEY ("page_key")
);

-- CreateTable
CREATE TABLE "memorial" (
    "id_memorial" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "raza" VARCHAR(100),
    "fecha" DATE NOT NULL,
    "dedicatoria" VARCHAR(255),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memorial_pkey" PRIMARY KEY ("id_memorial")
);

-- CreateTable
CREATE TABLE "instalacion" (
    "id_instalacion" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "features" TEXT[],
    "orden" SERIAL NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imagen_url" VARCHAR(500),

    CONSTRAINT "instalacion_pkey" PRIMARY KEY ("id_instalacion")
);

-- CreateTable
CREATE TABLE "about_block" (
    "id_block" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "items" TEXT[],
    "orden" SERIAL NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imagen_url" VARCHAR(500),

    CONSTRAINT "about_block_pkey" PRIMARY KEY ("id_block")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_reset_token_key" ON "usuario"("reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "producto_nombre_producto_key" ON "producto"("nombre_producto");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_id_pago_key" ON "pedido"("id_pago");

-- CreateIndex
CREATE UNIQUE INDEX "reserva_id_pedido_key" ON "reserva"("id_pedido");

-- CreateIndex
CREATE UNIQUE INDEX "reserva_cod_trazabilidad_key" ON "reserva"("cod_trazabilidad");

-- CreateIndex
CREATE UNIQUE INDEX "envio_id_pedido_key" ON "envio"("id_pedido");

-- CreateIndex
CREATE UNIQUE INDEX "valoracion_id_producto_id_usuario_key" ON "valoracion"("id_producto", "id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "page_content_page_key_key" ON "page_content"("page_key");

-- CreateIndex
CREATE UNIQUE INDEX "instalacion_title_key" ON "instalacion"("title");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "rol"("id_rol") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_id_proveedor_fkey" FOREIGN KEY ("id_proveedor") REFERENCES "proveedor"("id_proveedor") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_id_pago_fkey" FOREIGN KEY ("id_pago") REFERENCES "pago"("id_pago") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pedido" ADD CONSTRAINT "detalle_pedido_cod_producto_fkey" FOREIGN KEY ("cod_producto") REFERENCES "producto"("cod_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio" ADD CONSTRAINT "envio_id_pedido_fkey" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mascota" ADD CONSTRAINT "mascota_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mascota" ADD CONSTRAINT "mascota_id_especie_fkey" FOREIGN KEY ("id_especie") REFERENCES "especie"("id_especie") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "valoracion" ADD CONSTRAINT "valoracion_id_producto_fkey" FOREIGN KEY ("id_producto") REFERENCES "producto"("cod_producto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valoracion" ADD CONSTRAINT "valoracion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
