const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const {
    registrarVenta,
    listarVentas,
    detalleVenta,
    anularVenta
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
    '/:id',
    verificarToken,
    detalleVenta
);

router.put(
    '/:id/anular',
    verificarToken,
    anularVenta
);

module.exports = router;
