const pool = require('../config/db');

const obtenerMasVendidos = async (
    desde,
    hasta
) => {

    let query = `
        SELECT
            p.id,
            p.nombre,
            p.precio,
            c.nombre AS categoria,
            SUM(dv.cantidad) AS total_vendido,
            SUM(dv.subtotal) AS total_ingresos
        FROM detalle_ventas dv
        INNER JOIN productos p
            ON p.id = dv.producto_id
        INNER JOIN categorias c
            ON c.id = p.categoria_id
        INNER JOIN ventas v
            ON v.id = dv.venta_id
        WHERE v.estado != 'ANULADA'
    `;

    const params = [];

    if (desde && hasta) {
        query += ` AND v.fecha BETWEEN $1 AND $2`;
        params.push(desde, hasta);
    }

    query += `
        GROUP BY
            p.id,
            p.nombre,
            p.precio,
            c.nombre
        ORDER BY total_vendido DESC
        LIMIT 10
    `;

    const result = await pool.query(query, params);
    return result.rows;
};

module.exports = {
    obtenerMasVendidos
};
