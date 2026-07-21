const pool = require('../config/db');

const crear = async (
    venta_id,
    usuario_id,
    nombre_cliente,
    cedula_ruc,
    direccion,
    correo,
    telefono,
    metodo_pago
) => {

    const result = await pool.query(`
        INSERT INTO facturas
        (
            venta_id,
            usuario_id,
            nombre_cliente,
            cedula_ruc,
            direccion,
            correo,
            telefono,
            metodo_pago
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING *
    `,
    [
        venta_id,
        usuario_id,
        nombre_cliente,
        cedula_ruc,
        direccion,
        correo,
        telefono,
        metodo_pago
    ]);

    return result.rows[0];
};

const crearAutorizaciones = async (factura_id, productos) => {

    for (const item of productos) {

        const prodResult = await pool.query(
            `SELECT nombre FROM productos WHERE id = $1`,
            [item.producto_id]
        );

        const nombreProducto = prodResult.rows.length > 0
            ? prodResult.rows[0].nombre
            : `Producto #${item.producto_id}`;

        await pool.query(`
            INSERT INTO autorizaciones_salida
            (
                producto_id,
                cantidad,
                observacion,
                factura_id,
                estado
            )
            VALUES
            ($1, $2, $3, $4, 'PENDIENTE')
        `,
        [
            item.producto_id,
            item.cantidad,
            `Salida por factura #${factura_id} - ${nombreProducto}`,
            factura_id
        ]);
    }

};

const listarPendientes = async () => {

    const result = await pool.query(`
        SELECT
            f.*,
            v.total,
            v.estado AS venta_estado,
            u.nombre AS cajero_nombre,
            u.apellido AS cajero_apellido
        FROM facturas f
        INNER JOIN ventas v ON v.id = f.venta_id
        INNER JOIN usuarios u ON u.id = f.usuario_id
        WHERE f.estado = 'PENDIENTE'
        ORDER BY f.fecha DESC
    `);

    return result.rows;
};

const listarPorUsuario = async (usuario_id) => {

    const result = await pool.query(`
        SELECT
            f.*,
            v.total,
            v.estado AS venta_estado
        FROM facturas f
        INNER JOIN ventas v ON v.id = f.venta_id
        WHERE f.usuario_id = $1
        ORDER BY f.fecha DESC
    `, [usuario_id]);

    return result.rows;
};

const obtenerPorId = async (id) => {

    const result = await pool.query(`
        SELECT
            f.*,
            v.total,
            v.estado AS venta_estado,
            u.nombre AS cajero_nombre,
            u.apellido AS cajero_apellido
        FROM facturas f
        INNER JOIN ventas v ON v.id = f.venta_id
        INNER JOIN usuarios u ON u.id = f.usuario_id
        WHERE f.id = $1
    `, [id]);

    return result.rows[0];
};

const obtenerDetalleVenta = async (venta_id) => {

    const result = await pool.query(`
        SELECT
            dv.*,
            p.nombre AS producto,
            p.stock
        FROM detalle_ventas dv
        INNER JOIN productos p ON p.id = dv.producto_id
        WHERE dv.venta_id = $1
    `, [venta_id]);

    return result.rows;
};

const verificarYCerrarFactura = async (factura_id) => {

    const pendientes = await pool.query(`
        SELECT COUNT(*) AS total
        FROM autorizaciones_salida
        WHERE factura_id = $1 AND estado = 'PENDIENTE'
    `, [factura_id]);

    if (parseInt(pendientes.rows[0].total) === 0) {

        await pool.query(`
            UPDATE facturas SET estado = 'PROCESADA' WHERE id = $1
        `, [factura_id]);

        const facturaResult = await pool.query(
            `SELECT venta_id FROM facturas WHERE id = $1`,
            [factura_id]
        );

        if (facturaResult.rows.length > 0) {
            await pool.query(`
                UPDATE ventas SET estado = 'COMPLETADA' WHERE id = $1
            `, [facturaResult.rows[0].venta_id]);
        }
    }

};

const procesarSalida = async (factura_id) => {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const facturaResult = await client.query(
            `SELECT * FROM facturas WHERE id = $1`,
            [factura_id]
        );

        if (facturaResult.rows.length === 0) {
            throw new Error('Factura no encontrada');
        }

        const factura = facturaResult.rows[0];

        if (factura.estado !== 'PENDIENTE') {
            throw new Error('La factura ya fue procesada o cancelada');
        }

        const ventaResult = await client.query(
            `SELECT * FROM ventas WHERE id = $1`,
            [factura.venta_id]
        );

        const venta = ventaResult.rows[0];

        const detalleResult = await client.query(
            `SELECT * FROM detalle_ventas WHERE venta_id = $1`,
            [venta.id]
        );

        for (const item of detalleResult.rows) {

            const prodResult = await client.query(
                `SELECT stock FROM productos WHERE id = $1`,
                [item.producto_id]
            );

            if (prodResult.rows.length === 0) {
                throw new Error(`Producto ${item.producto_id} no encontrado`);
            }

            const stockActual = prodResult.rows[0].stock;

            if (stockActual < item.cantidad) {
                throw new Error(`Stock insuficiente para producto ${item.producto_id}. Stock actual: ${stockActual}, requerido: ${item.cantidad}`);
            }

            await client.query(
                `UPDATE productos SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [item.cantidad, item.producto_id]
            );

            await client.query(
                `INSERT INTO movimientos_inventario (producto_id, tipo, cantidad)
                 VALUES ($1, 'SALIDA', $2)`,
                [
                    item.producto_id,
                    item.cantidad
                ]
            );
        }

        await client.query(
            `UPDATE ventas SET estado = 'COMPLETADA' WHERE id = $1`,
            [venta.id]
        );

        await client.query(
            `UPDATE facturas SET estado = 'PROCESADA' WHERE id = $1`,
            [factura_id]
        );

        await client.query('COMMIT');

        return { mensaje: 'Salida procesada y stock actualizado' };

    } catch (error) {

        await client.query('ROLLBACK');
        throw error;

    } finally {

        client.release();

    }

};

module.exports = {
    crear,
    crearAutorizaciones,
    listarPendientes,
    listarPorUsuario,
    obtenerPorId,
    obtenerDetalleVenta,
    verificarYCerrarFactura,
    procesarSalida
};
