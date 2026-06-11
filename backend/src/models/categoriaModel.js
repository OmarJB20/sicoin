const pool = require('../config/db');

const obtenerCategorias = async () => {

    const result = await pool.query(
        `
        SELECT *
        FROM categorias
        WHERE estado = true
        ORDER BY id ASC
        `
    );

    return result.rows;
};

const obtenerCategoriaPorId = async (id) => {

    const result = await pool.query(
        `
        SELECT *
        FROM categorias
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const crearCategoria = async (
    nombre,
    descripcion
) => {

    const result = await pool.query(
        `
        INSERT INTO categorias
        (
            nombre,
            descripcion
        )
        VALUES
        ($1, $2)
        RETURNING *
        `,
        [nombre, descripcion]
    );

    return result.rows[0];
};

const actualizarCategoria = async (
    id,
    nombre,
    descripcion,
    estado
) => {

    const result = await pool.query(
        `
        UPDATE categorias
        SET
            nombre = $1,
            descripcion = $2,
            estado = $3
        WHERE id = $4
        RETURNING *
        `,
        [
            nombre,
            descripcion,
            estado,
            id
        ]
    );

    return result.rows[0];
};

const eliminarCategoria = async (id) => {

    const result = await pool.query(
        `
        UPDATE categorias
        SET estado = false
        WHERE id = $1
        RETURNING *
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    obtenerCategorias,
    obtenerCategoriaPorId,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};