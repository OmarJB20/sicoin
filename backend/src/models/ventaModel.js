const pool = require('../config/db');

const crearVenta = async (cliente_id, productos) => {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        let total = 0;

        const ventaResult = await client.query(
            `
            INSERT INTO ventas
            (cliente_id, total)
            VALUES ($1, 0)
            RETURNING *
            `,
            [cliente_id]
        );

        const venta = ventaResult.rows[0];

        for (const item of productos) {

            const productoResult = await client.query(
                `
                SELECT *
                FROM productos
                WHERE id = $1
                `,
                [item.producto_id]
            );

            if (productoResult.rows.length === 0) {
                throw new Error(
                    `Producto ${item.producto_id} no existe`
                );
            }

            const producto = productoResult.rows[0];

            if (producto.stock < item.cantidad) {
                throw new Error(
                    `Stock insuficiente para ${producto.nombre}`
                );
            }

            const subtotal =
                Number(producto.precio) *
                Number(item.cantidad);

            total += subtotal;

            await client.query(
                `
                INSERT INTO detalle_ventas
                (
                    venta_id,
                    producto_id,
                    cantidad,
                    precio_unitario,
                    subtotal
                )
                VALUES ($1,$2,$3,$4,$5)
                `,
                [
                    venta.id,
                    item.producto_id,
                    item.cantidad,
                    producto.precio,
                    subtotal
                ]
            );

            await client.query(
                `
                UPDATE productos
                SET stock = stock - $1
                WHERE id = $2
                `,
                [
                    item.cantidad,
                    item.producto_id
                ]
            );

        }

        await client.query(
            `
            UPDATE ventas
            SET total = $1
            WHERE id = $2
            `,
            [total, venta.id]
        );

        await client.query('COMMIT');

        return {
            venta_id: venta.id,
            total
        };

    } catch (error) {

        await client.query('ROLLBACK');
        throw error;

    } finally {

        client.release();

    }

};

const obtenerVentas = async () => {

    const result = await pool.query(`
        SELECT
            v.*,
            c.nombre,
            c.apellido
        FROM ventas v
        INNER JOIN clientes c
            ON v.cliente_id = c.id
        ORDER BY v.id DESC
    `);

    return result.rows;
};

const obtenerDetalleVenta = async (id) => {

    const result = await pool.query(`
        SELECT
            dv.*,
            p.nombre AS producto
        FROM detalle_ventas dv
        INNER JOIN productos p
            ON dv.producto_id = p.id
        WHERE dv.venta_id = $1
    `,[id]);

    return result.rows;
};

module.exports = {
    crearVenta,
    obtenerVentas,
    obtenerDetalleVenta
};