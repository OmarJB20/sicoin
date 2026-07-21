const pool = require('../config/db');

const crearVenta = async (cliente_id, productos) => {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        let total = 0;

        const ventaResult = await client.query(
            `
            INSERT INTO ventas
            (cliente_id, total, estado)
            VALUES ($1, 0, 'COMPLETADA')
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

        try {
            const alertas = await pool.query(`
                SELECT
                    p.id, p.stock,
                    COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1), 2), 0) AS promedio_diario,
                    COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1) * 7), 0) AS stock_minimo_sugerido,
                    CASE
                        WHEN p.stock = 0 THEN 'AGOTADO'
                        WHEN p.stock <= COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1) * 7 * 0.5), 0) THEN 'CRITICO'
                        ELSE 'ALERTA'
                    END AS nivel_alerta,
                    CASE
                        WHEN p.stock = 0 THEN CONCAT(p.nombre, ' - AGOTADO (Stock: 0, Sugerido: ', COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1) * 7), 0), ')')
                        ELSE CONCAT(p.nombre, ' - Stock bajo (Stock: ', p.stock, ', Sugerido: ', COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1) * 7), 0), ')')
                    END AS mensaje
                FROM productos p
                LEFT JOIN (
                    SELECT dv.producto_id, DATE(v.fecha) AS dia, SUM(dv.cantidad) AS daily_qty
                    FROM detalle_ventas dv
                    INNER JOIN ventas v ON v.id = dv.venta_id AND v.estado != 'ANULADA'
                        AND v.fecha >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY dv.producto_id, DATE(v.fecha)
                ) sq ON sq.producto_id = p.id
                WHERE p.id = ANY($1::int[])
                GROUP BY p.id, p.nombre, p.stock
                HAVING p.stock <= COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1) * 7), 0)
                    OR p.stock = 0
            `, [productos.map(i => i.producto_id)]);

            for (const a of alertas.rows) {
                const existe = await pool.query(
                    `SELECT id FROM alertas_stock WHERE producto_id = $1 AND leida = false`,
                    [a.id]
                );
                if (existe.rows.length === 0) {
                    await pool.query(`
                        INSERT INTO alertas_stock (producto_id, nivel_alerta, stock_actual, promedio_diario, stock_minimo_sugerido, mensaje)
                        VALUES ($1, $2, $3, $4, $5, $6)
                    `, [a.id, a.nivel_alerta, a.stock, a.promedio_diario, a.stock_minimo_sugerido, a.mensaje]);
                }
            }
        } catch (_) {
            console.error('Error al verificar alertas post-venta:', _.message);
        }

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
            c.apellido,
            (
                SELECT COUNT(dv.id)
                FROM detalle_ventas dv
                WHERE dv.venta_id = v.id
            ) AS num_productos
        FROM ventas v
        LEFT JOIN clientes c
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

const anularVenta = async (id) => {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const ventaResult = await client.query(
            `SELECT * FROM ventas WHERE id = $1`,
            [id]
        );

        if (ventaResult.rows.length === 0) {
            throw new Error('Venta no encontrada');
        }

        const venta = ventaResult.rows[0];

        if (venta.estado === 'ANULADA') {
            throw new Error('La venta ya está anulada');
        }

        const detalleResult = await client.query(
            `SELECT * FROM detalle_ventas WHERE venta_id = $1`,
            [id]
        );

        for (const item of detalleResult.rows) {
            await client.query(
                `
                UPDATE productos
                SET stock = stock + $1
                WHERE id = $2
                `,
                [item.cantidad, item.producto_id]
            );
        }

        await client.query(
            `
            UPDATE ventas
            SET estado = 'ANULADA'
            WHERE id = $1
            `,
            [id]
        );

        await client.query('COMMIT');

        return { mensaje: 'Venta anulada' };

    } catch (error) {

        await client.query('ROLLBACK');
        throw error;

    } finally {

        client.release();

    }

};

const obtenerVentasPorCliente = async (cliente_id) => {

    const result = await pool.query(`
        SELECT
            v.id,
            v.total,
            v.estado,
            v.fecha,
            (
                SELECT COUNT(dv.id)
                FROM detalle_ventas dv
                WHERE dv.venta_id = v.id
            ) AS num_productos
        FROM ventas v
        WHERE v.cliente_id = $1
        ORDER BY v.fecha DESC
    `, [cliente_id]);

    return result.rows;
};

const obtenerDetalleVentaPorCliente = async (ventaId, cliente_id) => {

    const result = await pool.query(`
        SELECT
            dv.cantidad,
            dv.precio_unitario,
            dv.subtotal,
            p.nombre AS producto
        FROM detalle_ventas dv
        INNER JOIN productos p ON p.id = dv.producto_id
        INNER JOIN ventas v ON v.id = dv.venta_id
        WHERE dv.venta_id = $1 AND v.cliente_id = $2
    `, [ventaId, cliente_id]);

    return result.rows;
};

const crearVentaPendiente = async (productos) => {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        let total = 0;

        const ventaResult = await client.query(
            `
            INSERT INTO ventas
            (cliente_id, total, estado)
            VALUES (NULL, 0, 'PENDIENTE')
            RETURNING *
            `
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

module.exports = {
    crearVenta,
    crearVentaPendiente,
    obtenerVentas,
    obtenerDetalleVenta,
    anularVenta,
    obtenerVentasPorCliente,
    obtenerDetalleVentaPorCliente
};
