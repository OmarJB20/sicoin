const pool = require('../config/db');

const obtenerRoles = async () => {

    const result = await pool.query(
        'SELECT id, nombre FROM roles ORDER BY id'
    );

    return result.rows;
};

const obtenerRolPorId = async (id) => {

    const result = await pool.query(
        'SELECT id, nombre FROM roles WHERE id = $1',
        [id]
    );

    return result.rows[0];
};

module.exports = {
    obtenerRoles,
    obtenerRolPorId
};
