const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const {
    registrarVenta,
    listarVentas,
    detalleVenta
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

module.exports = router;