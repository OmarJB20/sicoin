const autorizacionModel =
require('../models/autorizacionModel');
const movimientoModel =
require('../models/movimientoModel');

const listarAutorizaciones = async (
    req,
    res
) => {

    try {

        const autorizaciones =
            await autorizacionModel.listar();

        res.json(autorizaciones);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const crearAutorizacion = async (
    req,
    res
) => {

    try {

        const {
            producto_id,
            cantidad,
            observacion
        } = req.body;

        const autorizacion =
            await autorizacionModel.crear(
                producto_id,
                cantidad,
                observacion
            );

        res.status(201).json({
            mensaje: 'Solicitud creada',
            autorizacion
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const actualizarEstado = async (
    req,
    res
) => {

    try {

        const { id } = req.params;
        const { estado } = req.body;

        const autorizacion =
            await autorizacionModel.actualizarEstado(
                id,
                estado
            );

        if (!autorizacion) {

            return res.status(404).json({
                mensaje: 'Autorización no encontrada'
            });

        }

        if (estado === 'AUTORIZADO') {

            await movimientoModel.registrarMovimiento(
                autorizacion.producto_id,
                req.usuario.id,
                'SALIDA',
                autorizacion.cantidad,
                'Salida autorizada por bodeguero'
            );

        }

        res.json({
            mensaje: 'Estado actualizado',
            autorizacion
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const eliminarAutorizacion = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const autorizacion =
            await autorizacionModel.eliminar(id);

        if (!autorizacion) {

            return res.status(404).json({
                mensaje: 'Autorización no encontrada'
            });

        }

        res.json({
            mensaje: 'Autorización eliminada',
            autorizacion
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

module.exports = {
    listarAutorizaciones,
    crearAutorizacion,
    actualizarEstado,
    eliminarAutorizacion
};
