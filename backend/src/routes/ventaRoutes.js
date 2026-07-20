const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const {
    registrarVenta,
    listarVentas,
    detalleVenta,
    anularVenta,
    listarVentasPorCliente,
    detalleVentaPorCliente
} = require('../controllers/ventaController');

router.post(
    '/',
    verificarToken,
    registrarVenta
);

router.get(
    '/',
    verificarToken,
    listarVentas
);

router.get(
    '/mis-compras',
    verificarToken,
    listarVentasPorCliente
);

router.get(
    '/:id',
    verificarToken,
    detalleVenta
);

router.get(
    '/:id/detalle-cliente',
    verificarToken,
    detalleVentaPorCliente
);

router.put(
    '/:id/anular',
    verificarToken,
    anularVenta
);

module.exports = router;
