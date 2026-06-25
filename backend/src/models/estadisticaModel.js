const pool = require('../config/db');

const obtenerEstadisticasStock = async () => {
    const result = await pool.query(`
        SELECT
            p.id,
            p.nombre,
            p.stock,
            p.stock_minimo,
            COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1), 2), 0) AS promedio_diario,
            COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(DISTINCT DATE_TRUNC('week', sq.dia)), 1), 2), 0) AS promedio_semanal,
            COALESCE(ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY sq.daily_qty)::decimal, 2), 0) AS mediana_diaria,
            COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1) * 7), 0) AS stock_minimo_sugerido
        FROM productos p
        LEFT JOIN (
            SELECT
                dv.producto_id,
                DATE(v.fecha) AS dia,
                SUM(dv.cantidad) AS daily_qty
            FROM detalle_ventas dv
            INNER JOIN ventas v ON v.id = dv.venta_id
                AND v.estado != 'ANULADA'
                AND v.fecha >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY dv.producto_id, DATE(v.fecha)
        ) sq ON sq.producto_id = p.id
        WHERE p.estado = true
        GROUP BY p.id, p.nombre, p.stock, p.stock_minimo
        ORDER BY p.id
    `);
    return result.rows;
};

const obtenerAlertasStock = async () => {
    const result = await pool.query(`
        SELECT
            p.id,
            p.nombre,
            p.stock,
            p.stock_minimo,
            COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1), 2), 0) AS promedio_diario,
            COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(DISTINCT DATE_TRUNC('week', sq.dia)), 1), 2), 0) AS promedio_semanal,
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
            SELECT
                dv.producto_id,
                DATE(v.fecha) AS dia,
                SUM(dv.cantidad) AS daily_qty
            FROM detalle_ventas dv
            INNER JOIN ventas v ON v.id = dv.venta_id
                AND v.estado != 'ANULADA'
                AND v.fecha >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY dv.producto_id, DATE(v.fecha)
        ) sq ON sq.producto_id = p.id
        WHERE p.estado = true
        GROUP BY p.id, p.nombre, p.stock, p.stock_minimo
        HAVING p.stock <= COALESCE(ROUND(SUM(sq.daily_qty)::decimal / GREATEST(COUNT(sq.dia), 1) * 7), 0)
            OR p.stock = 0
        ORDER BY p.stock ASC
    `);
    return result.rows;
};

const obtenerModaVentas = async () => {
    const result = await pool.query(`
        SELECT
            p.id,
            p.nombre,
            COUNT(DISTINCT DATE(v.fecha)) AS dias_con_ventas,
            COALESCE(SUM(dv.cantidad), 0) AS total_vendido
        FROM productos p
        INNER JOIN detalle_ventas dv ON dv.producto_id = p.id
        INNER JOIN ventas v ON v.id = dv.venta_id
            AND v.estado != 'ANULADA'
            AND v.fecha >= CURRENT_DATE - INTERVAL '30 days'
        WHERE p.estado = true
        GROUP BY p.id, p.nombre
        ORDER BY dias_con_ventas DESC, total_vendido DESC
        LIMIT 10
    `);
    return result.rows;
};

const insertarAlerta = async (producto_id, nivel_alerta, stock_actual, promedio_diario, stock_minimo_sugerido, mensaje) => {
    const result = await pool.query(`
        INSERT INTO alertas_stock
        (producto_id, nivel_alerta, stock_actual, promedio_diario, stock_minimo_sugerido, mensaje)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `, [producto_id, nivel_alerta, stock_actual, promedio_diario, stock_minimo_sugerido, mensaje]);
    return result.rows[0];
};

const existeAlertaPendiente = async (producto_id) => {
    const result = await pool.query(`
        SELECT id FROM alertas_stock
        WHERE producto_id = $1 AND leida = false
    `, [producto_id]);
    return result.rows.length > 0;
};

const obtenerAlertasPendientes = async () => {
    const result = await pool.query(`
        SELECT a.*, p.nombre AS producto
        FROM alertas_stock a
        INNER JOIN productos p ON p.id = a.producto_id
        WHERE a.leida = false
        ORDER BY a.created_at DESC
    `);
    return result.rows;
};

const marcarAlertaLeida = async (id) => {
    const result = await pool.query(`
        UPDATE alertas_stock SET leida = true WHERE id = $1 RETURNING *
    `, [id]);
    return result.rows[0];
};

module.exports = {
    obtenerEstadisticasStock,
    obtenerAlertasStock,
    obtenerModaVentas,
    insertarAlerta,
    existeAlertaPendiente,
    obtenerAlertasPendientes,
    marcarAlertaLeida
};
