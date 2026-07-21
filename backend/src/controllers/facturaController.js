const facturaModel = require('../models/facturaModel');

const crearFactura = async (req, res) => {

    try {

        const {
            venta_id,
            nombre_cliente,
            cedula_ruc,
            direccion,
            correo,
            telefono,
            metodo_pago
        } = req.body;

        const factura = await facturaModel.crear(
            venta_id,
            req.usuario.id,
            nombre_cliente,
            cedula_ruc,
            direccion,
            correo,
            telefono,
            metodo_pago
        );

        res.status(201).json({
            mensaje: 'Factura creada',
            factura
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const listarPendientes = async (req, res) => {

    try {

        const facturas = await facturaModel.listarPendientes();

        res.json(facturas);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const listarPorUsuario = async (req, res) => {

    try {

        const facturas = await facturaModel.listarPorUsuario(req.usuario.id);

        res.json(facturas);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const obtenerFactura = async (req, res) => {

    try {

        const { id } = req.params;

        const factura = await facturaModel.obtenerPorId(id);

        if (!factura) {
            return res.status(404).json({
                mensaje: 'Factura no encontrada'
            });
        }

        const detalle = await facturaModel.obtenerDetalleVenta(factura.venta_id);

        res.json({ ...factura, detalle });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const procesarSalida = async (req, res) => {

    try {

        const { id } = req.params;

        const resultado = await facturaModel.procesarSalida(id);

        res.json(resultado);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

module.exports = {
    crearFactura,
    listarPendientes,
    listarPorUsuario,
    obtenerFactura,
    procesarSalida
};
