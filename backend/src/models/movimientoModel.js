const pool = require('../config/db');

const registrarMovimiento = async (
    producto_id,
    tipo,
    cantidad
) => {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const producto = await client.query(
            'SELECT stock FROM productos WHERE id = $1',
            [producto_id]
        );

        if (producto.rows.length === 0) {
            throw new Error('Producto no encontrado');
        }

        let stockActual = producto.rows[0].stock;
        let nuevoStock = stockActual;

        if (tipo === 'ENTRADA') {
            nuevoStock += cantidad;
        }

        if (tipo === 'SALIDA') {

            if (stockActual < cantidad) {
                throw new Error(
                    'Stock insuficiente'
                );
            }

            nuevoStock -= cantidad;
        }

        await client.query(
            `UPDATE productos
             SET stock = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [nuevoStock, producto_id]
        );

        const movimiento =
            await client.query(
                `
                INSERT INTO movimientos_inventario
                (
                    producto_id,
                    tipo,
                    cantidad
                )
                VALUES
                ($1,$2,$3)
                RETURNING *
                `,
                [
                    producto_id,
                    tipo,
                    cantidad
                ]
            );

        await client.query('COMMIT');

        return movimiento.rows[0];

    } catch (error) {

        await client.query('ROLLBACK');
        throw error;

    } finally {

        client.release();

    }

};

const obtenerMovimientos = async () => {

    const result = await pool.query(`
        SELECT
            m.*,
            p.nombre AS producto
        FROM movimientos_inventario m
        INNER JOIN productos p
            ON p.id = m.producto_id
        ORDER BY m.fecha DESC
    `);

    return result.rows;
};

module.exports = {
    registrarMovimiento,
    obtenerMovimientos
};