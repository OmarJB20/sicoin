const pool = require('../config/db');

const buscarPorCorreo = async (correo) => {

    const result = await pool.query(
        'SELECT * FROM usuarios WHERE correo = $1',
        [correo]
    );

    return result.rows[0];
};

const crearUsuario = async (
    nombre,
    apellido,
    correo,
    password,
    rol_id,
    telefono,
    direccion
) => {

    const result = await pool.query(
        `
        INSERT INTO usuarios
        (
            nombre,
            apellido,
            correo,
            password,
            rol_id,
            telefono,
            direccion
        )
        VALUES
        ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        `,
        [
            nombre,
            apellido,
            correo,
            password,
            rol_id,
            telefono || null,
            direccion || null
        ]
    );

    return result.rows[0];
};

const obtenerUsuarios = async () => {

    const result = await pool.query(`
        SELECT
            u.id,
            u.nombre,
            u.apellido,
            u.correo,
            u.estado,
            u.created_at,
            u.rol_id,
            r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r
            ON u.rol_id = r.id
        ORDER BY u.estado DESC, u.id ASC
    `);

    return result.rows;
};

const obtenerUsuarioPorId = async (id) => {

    const result = await pool.query(`
        SELECT
            u.id,
            u.nombre,
            u.apellido,
            u.correo,
            u.estado,
            u.rol_id,
            u.imagen,
            u.created_at,
            r.nombre AS rol
        FROM usuarios u
        INNER JOIN roles r
            ON u.rol_id = r.id
        WHERE u.id = $1
        `,
        [id]
    );

    return result.rows[0];
};

const actualizarUsuario = async (
    id,
    nombre,
    apellido,
    correo,
    rol_id,
    estado,
    password,
    imagen
) => {

    if (password) {

        const result = await pool.query(`
            UPDATE usuarios
            SET
                nombre = $1,
                apellido = $2,
                correo = $3,
                rol_id = $4,
                estado = $5,
                password = $6,
                imagen = COALESCE($7, imagen),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
        `,
        [
            nombre,
            apellido,
            correo,
            rol_id,
            estado,
            password,
            imagen,
            id
        ]);

        return result.rows[0];

    }

    const result = await pool.query(`
        UPDATE usuarios
        SET
            nombre = $1,
            apellido = $2,
            correo = $3,
            rol_id = $4,
            estado = $5,
            imagen = COALESCE($6, imagen),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
    `,
    [
        nombre,
        apellido,
        correo,
        rol_id,
        estado,
        imagen,
        id
    ]);

    return result.rows[0];
};

const eliminarUsuario = async (id) => {

    const result = await pool.query(`
        UPDATE usuarios
        SET
            estado = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
    `,
    [id]);

    return result.rows[0];
};

module.exports = {
    buscarPorCorreo,
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario
};