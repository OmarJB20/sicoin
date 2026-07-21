const express = require('express');

const router = express.Router();

const verificarToken = require('../middlewares/authMiddleware');

const {
    crearFactura,
    listarPendientes,
    listarPorUsuario,
    obtenerFactura,
    procesarSalida
} = require('../controllers/facturaController');

router.get(
    '/',
    verificarToken,
    listarPendientes
);

router.get(
    '/mis-facturas',
    verificarToken,
    listarPorUsuario
);

router.get(
    '/:id',
    verificarToken,
    obtenerFactura
);

router.post(
    '/',
    verificarToken,
    crearFactura
);

router.put(
    '/:id/procesar-salida',
    verificarToken,
    procesarSalida
);

module.exports = router;
