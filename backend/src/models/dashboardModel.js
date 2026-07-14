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

const obtenerVentasSemanalesCliente = async (clienteId) => {
    const result = await pool.query(`
        SELECT
            EXTRACT(DOW FROM v.fecha) AS dia,
            COALESCE(SUM(v.total), 0) AS total
        FROM ventas v
        WHERE v.fecha >= date_trunc('week', CURRENT_DATE)
          AND v.estado != 'ANULADA'
          AND v.cliente_id = $1
        GROUP BY EXTRACT(DOW FROM v.fecha)
        ORDER BY dia
    `, [clienteId]);
    return result.rows;
};

const obtenerVentasPorCategoriaCliente = async (clienteId) => {
    const result = await pool.query(`
        SELECT
            cat.nombre AS categoria,
            COALESCE(SUM(dv.subtotal), 0) AS total
        FROM detalle_ventas dv
        INNER JOIN productos p ON p.id = dv.producto_id
        INNER JOIN categorias cat ON cat.id = p.categoria_id
        INNER JOIN ventas v ON v.id = dv.venta_id
        WHERE v.estado != 'ANULADA'
          AND v.cliente_id = $1
        GROUP BY cat.nombre
        ORDER BY total DESC
    `, [clienteId]);
    return result.rows;
};

const obtenerResumenCliente = async (clienteId) => {
    const totalCompras = await pool.query(`
        SELECT COUNT(*) AS total
        FROM ventas
        WHERE estado != 'ANULADA' AND cliente_id = $1
    `, [clienteId]);

    const totalProductosComprados = await pool.query(`
        SELECT COALESCE(SUM(dv.cantidad), 0) AS total
        FROM detalle_ventas dv
        INNER JOIN ventas v ON v.id = dv.venta_id
        WHERE v.estado != 'ANULADA' AND v.cliente_id = $1
    `, [clienteId]);

    const totalGastado = await pool.query(`
        SELECT COALESCE(SUM(total), 0) AS total
        FROM ventas
        WHERE estado != 'ANULADA' AND cliente_id = $1
    `, [clienteId]);

    const comprasMes = await pool.query(`
        SELECT COUNT(*) AS total
        FROM ventas
        WHERE estado != 'ANULADA' AND cliente_id = $1
          AND fecha >= date_trunc('month', CURRENT_DATE)
    `, [clienteId]);

    return {
        totalCompras: Number(totalCompras.rows[0].total),
        totalProductosComprados: Number(totalProductosComprados.rows[0].total),
        totalGastado: Number(totalGastado.rows[0].total),
        comprasMes: Number(comprasMes.rows[0].total)
    };
};

module.exports = {
    obtenerVentasSemanales,
    obtenerVentasPorCategoria,
    obtenerResumen,
    obtenerVentasSemanalesCliente,
    obtenerVentasPorCategoriaCliente,
    obtenerResumenCliente
};
