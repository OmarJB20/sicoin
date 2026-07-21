const pool = require('../config/db');

const listar = async () => {

    const result = await pool.query(`
        SELECT
            a.*,
            p.nombre AS producto,
            f.nombre_cliente,
            f.cedula_ruc,
            f.direccion,
            f.correo,
            f.telefono,
            f.metodo_pago
        FROM autorizaciones_salida a
        INNER JOIN productos p
            ON p.id = a.producto_id
        LEFT JOIN facturas f
            ON f.id = a.factura_id
        ORDER BY a.created_at DESC
    `);

    return result.rows;
};

const crear = async (
    producto_id,
    cantidad,
    observacion,
    factura_id
) => {

    const result = await pool.query(`
        INSERT INTO autorizaciones_salida
        (
            producto_id,
            cantidad,
            observacion,
            factura_id
        )
        VALUES
        ($1,$2,$3,$4)
        RETURNING *
    `,
    [
        producto_id,
        cantidad,
        observacion,
        factura_id || null
    ]);

    return result.rows[0];
};

const actualizarEstado = async (id, estado) => {

    const result = await pool.query(`
        UPDATE autorizaciones_salida
        SET
            estado = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `,
    [estado, id]);

    return result.rows[0];
};

const eliminar = async (id) => {

    const result = await pool.query(
        'DELETE FROM autorizaciones_salida WHERE id = $1 RETURNING *',
        [id]
    );

    return result.rows[0];
};

module.exports = {
    listar,
    crear,
    actualizarEstado,
    eliminar
};
