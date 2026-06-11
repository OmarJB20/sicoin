const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const {
    registrarMovimiento,
    listarMovimientos
} = require('../controllers/movimientoController');

router.post(
    '/',
    verificarToken,
    registrarMovimiento
);

router.get(
    '/',
    verificarToken,
    listarMovimientos
);

module.exports = router;