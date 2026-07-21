const autorizacionModel =
require('../models/autorizacionModel');
const movimientoModel =
require('../models/movimientoModel');
const facturaModel =
require('../models/facturaModel');
const {
    enviarFacturaPDF
} = require('../services/emailService');

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
                observacion,
                req.body.factura_id
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
                'SALIDA',
                autorizacion.cantidad
            );

            if (autorizacion.factura_id) {

                console.log(`Autorización #${id} vinculada a factura #${autorizacion.factura_id}`);

                await facturaModel.verificarYCerrarFactura(
                    autorizacion.factura_id
                );

                try {

                    const factura =
                        await facturaModel.obtenerPorId(
                            autorizacion.factura_id
                        );

                    console.log(`Factura #${autorizacion.factura_id}: correo=${factura?.correo}, cliente=${factura?.nombre_cliente}`);

                    if (factura && factura.correo) {

                        const detalles =
                            await facturaModel.obtenerDetalleVenta(
                                factura.venta_id
                            );

                        console.log(`Factura #${autorizacion.factura_id}: ${detalles.length} productos encontrados`);

                        await enviarFacturaPDF(
                            factura,
                            detalles
                        );

                        console.log(`Factura #${autorizacion.factura_id}: Email enviado exitosamente`);

                    } else {

                        console.log(`Factura #${autorizacion.factura_id}: No se envía email - correo vacío o factura no encontrada`);

                    }

                } catch (emailError) {

                    console.error(
                        `Factura #${autorizacion.factura_id}: Error al enviar email -`,
                        emailError.message
                    );

                }

            } else {

                console.log(`Autorización #${id}: No tiene factura_id asociada`);

            }

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
