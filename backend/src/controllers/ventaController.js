const ventaModel =
require('../models/ventaModel');

const registrarVenta = async (
    req,
    res
) => {

    try {

        const {
            cliente_id,
            productos
        } = req.body;

        const venta =
            await ventaModel.crearVenta(
                cliente_id,
                productos
            );

        res.status(201).json({
            mensaje: 'Venta registrada',
            venta
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const listarVentas = async (
    req,
    res
) => {

    try {

        const ventas =
            await ventaModel.obtenerVentas();

        res.json(ventas);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const detalleVenta = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const detalle =
            await ventaModel.obtenerDetalleVenta(id);

        res.json(detalle);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const anularVenta = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const resultado =
            await ventaModel.anularVenta(id);

        res.json(resultado);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const listarVentasPorCliente = async (
    req,
    res
) => {

    try {

        const cliente_id = req.usuario.cliente_id;

        const ventas =
            await ventaModel.obtenerVentasPorCliente(cliente_id);

        res.json(ventas);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

const detalleVentaPorCliente = async (
    req,
    res
) => {

    try {

        const { id } = req.params;
        const cliente_id = req.usuario.cliente_id;

        const detalle =
            await ventaModel.obtenerDetalleVentaPorCliente(
                id,
                cliente_id
            );

        res.json(detalle);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

module.exports = {
    registrarVenta,
    listarVentas,
    detalleVenta,
    anularVenta,
    listarVentasPorCliente,
    detalleVentaPorCliente
};
