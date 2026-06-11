const movimientoModel =
require('../models/movimientoModel');

const registrarMovimiento = async (
    req,
    res
) => {

    try {

        const {
            producto_id,
            usuario_id,
            tipo_movimiento,
            cantidad,
            observacion
        } = req.body;

        const movimiento =
            await movimientoModel.registrarMovimiento(
                producto_id,
                usuario_id,
                tipo_movimiento,
                cantidad,
                observacion
            );

        res.status(201).json({
            mensaje: 'Movimiento registrado',
            movimiento
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const listarMovimientos = async (
    req,
    res
) => {

    try {

        const movimientos =
            await movimientoModel.obtenerMovimientos();

        res.json(movimientos);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

module.exports = {
    registrarMovimiento,
    listarMovimientos
};