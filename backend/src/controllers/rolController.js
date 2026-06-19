const rolModel = require('../models/rolModel');

const listarRoles = async (req, res) => {

    try {

        const roles = await rolModel.obtenerRoles();

        res.json(roles);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const obtenerRol = async (req, res) => {

    try {

        const { id } = req.params;

        const rol = await rolModel.obtenerRolPorId(id);

        if (!rol) {

            return res.status(404).json({
                mensaje: 'Rol no encontrado'
            });

        }

        res.json(rol);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

module.exports = {
    listarRoles,
    obtenerRol
};
