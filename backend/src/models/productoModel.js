const pool = require('../config/db');

const obtenerProductos = async () => {

    const result = await pool.query(`
        SELECT
            p.*,
            c.nombre AS categoria
        FROM productos p
        INNER JOIN categorias c
            ON p.categoria_id = c.id
        WHERE p.estado = true
        ORDER BY p.id ASC
    `);

    return result.rows;
};

const obtenerProductoPorId = async (id) => {

    const result = await pool.query(`
        SELECT
            p.*,
            c.nombre AS categoria
        FROM productos p
        INNER JOIN categorias c
            ON p.categoria_id = c.id
        WHERE p.id = $1
    `,[id]);

    return result.rows[0];
};

const crearProducto = async (
    categoria_id,
    nombre,
    descripcion,
    precio,
    stock,
    stock_minimo,
    imagen
) => {

    const result = await pool.query(`
        INSERT INTO productos
        (
            categoria_id,
            nombre,
            descripcion,
            precio,
            stock,
            stock_minimo,
            imagen
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
    `,
    [
        categoria_id,
        nombre,
        descripcion,
        precio,
        stock,
        stock_minimo,
        imagen
    ]);

    return result.rows[0];
};

const actualizarProducto = async (
    id,
    categoria_id,
    nombre,
    descripcion,
    precio,
    stock,
    stock_minimo,
    imagen,
    estado
) => {

    const result = await pool.query(`
        UPDATE productos
        SET
            categoria_id = $1,
            nombre = $2,
            descripcion = $3,
            precio = $4,
            stock = $5,
            stock_minimo = $6,
            imagen = $7,
            estado = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
    `,
    [
        categoria_id,
        nombre,
        descripcion,
        precio,
        stock,
        stock_minimo,
        imagen,
        estado,
        id
    ]);

    return result.rows[0];
};

const eliminarProducto = async (id) => {

    const result = await pool.query(
        `
        UPDATE productos
        SET
            estado = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};