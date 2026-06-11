const usuarioModel =
require('../models/usuarioModel');

const listarUsuarios = async (req, res) => {

    try {

        const usuarios =
            await usuarioModel.obtenerUsuarios();

        res.json(usuarios);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const obtenerUsuario = async (req, res) => {

    try {

        const { id } = req.params;

        const usuario =
            await usuarioModel.obtenerUsuarioPorId(id);

        if (!usuario) {

            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });

        }

        res.json(usuario);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const actualizarUsuario = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            apellido,
            correo,
            rol_id,
            estado
        } = req.body;

        const usuario =
            await usuarioModel.actualizarUsuario(
                id,
                nombre,
                apellido,
                correo,
                rol_id,
                estado
            );

        res.json({
            mensaje: 'Usuario actualizado',
            usuario
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const eliminarUsuario = async (req, res) => {

    try {

        const { id } = req.params;

        const usuario =
            await usuarioModel.eliminarUsuario(id);

        res.json({
            mensaje: 'Usuario desactivado',
            usuario
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

module.exports = {
    listarUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario
};