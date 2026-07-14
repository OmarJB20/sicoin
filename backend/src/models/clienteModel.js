const pool = require('../config/db');

const obtenerClientes = async () => {

    const result = await pool.query(
        `
        SELECT *
        FROM clientes
        ORDER BY id ASC
        `
    );

    return result.rows;
};

const obtenerClientePorId = async (id) => {

    const result = await pool.query(
        `
        SELECT *
        FROM clientes
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const crearCliente = async (
    nombre,
    apellido,
    correo,
    password,
    telefono,
    direccion
) => {

    const result = await pool.query(
        `
        INSERT INTO clientes
        (
            nombre,
            apellido,
            correo,
            password,
            telefono,
            direccion
        )
        VALUES
        ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
            nombre,
            apellido,
            correo,
            password,
            telefono,
            direccion
        ]
    );

    return result.rows[0];
};

const actualizarCliente = async (
    id,
    nombre,
    apellido,
    correo,
    telefono,
    direccion,
    estado
) => {

    const result = await pool.query(
        `
        UPDATE clientes
        SET
            nombre = $1,
            apellido = $2,
            correo = $3,
            telefono = $4,
            direccion = $5,
            estado = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
        `,
        [
            nombre,
            apellido,
            correo,
            telefono,
            direccion,
            estado,
            id
        ]
    );

    return result.rows[0];
};

const buscarPorCorreo = async (correo) => {

    const result = await pool.query(
        `
        SELECT *
        FROM clientes
        WHERE correo = $1
        `,
        [correo]
    );

    return result.rows[0];
};

const eliminarCliente = async (id) => {

    const result = await pool.query(
        `
        UPDATE clientes
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
    obtenerClientes,
    obtenerClientePorId,
    buscarPorCorreo,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};