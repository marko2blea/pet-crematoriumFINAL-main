export default defineEventHandler(async (event) => {
  const { id } = getQuery(event); // debe recibir id
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Falta ID de reserva' });

  try {
    const pedido = await db.pedido.findUniqueOrThrow({
      where: { id_pedido: Number(id) },
      include: {
        reserva: true,
        pago: true
      }
    });
    return pedido;
  } catch (err) {
    console.error('Error al consultar el pedido:', err);
    throw createError({ statusCode: 500, statusMessage: 'Error al consultar el pedido.' });
  }
});
