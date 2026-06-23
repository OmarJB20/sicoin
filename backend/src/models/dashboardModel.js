const pool = require('../config/db');

const obtenerVentasSemanales = async () => {
    const result = await pool.query(`
        SELECT
            EXTRACT(DOW FROM v.fecha) AS dia,
            COALESCE(SUM(v.total), 0) AS total
        FROM ventas v
        WHERE v.fecha >= date_trunc('week', CURRENT_DATE)
          AND v.estado != 'ANULADA'
        GROUP BY EXTRACT(DOW FROM v.fecha)
        ORDER BY dia
    `);
    return result.rows;
};

const obtenerVentasPorCategoria = async () => {
    const result = await pool.query(`
        SELECT
            c.nombre AS categoria,
            COALESCE(SUM(dv.subtotal), 0) AS total
        FROM detalle_ventas dv
        INNER JOIN productos p ON p.id = dv.producto_id
        INNER JOIN categorias c ON c.id = p.categoria_id
        INNER JOIN ventas v ON v.id = dv.venta_id
        WHERE v.estado != 'ANULADA'
        GROUP BY c.nombre
        ORDER BY total DESC
    `);
    return result.rows;
};

const obtenerResumen = async () => {
    const totalVentas = await pool.query(`
        SELECT COALESCE(SUM(total), 0) AS total
        FROM ventas
        WHERE estado != 'ANULADA'
    `);

    const totalStock = await pool.query(`
        SELECT COALESCE(SUM(stock), 0) AS total
        FROM productos
    `);

    const totalProductos = await pool.query(`
        SELECT COUNT(*) AS total
        FROM productos
    `);

    const totalReportes = await pool.query(`
        SELECT COUNT(*) AS total
        FROM ventas
        WHERE estado != 'ANULADA'
    `);

    return {
        totalVentas: Number(totalVentas.rows[0].total),
        totalStock: Number(totalStock.rows[0].total),
        totalProductos: Number(totalProductos.rows[0].total),
        totalReportes: Number(totalReportes.rows[0].total)
    };
};

module.exports = {
    obtenerVentasSemanales,
    obtenerVentasPorCategoria,
    obtenerResumen
};
