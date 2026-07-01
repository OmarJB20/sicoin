const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const {
    listarAutorizaciones,
    crearAutorizacion,
    actualizarEstado,
    eliminarAutorizacion
} = require('../controllers/autorizacionController');

router.get(
    '/',
    verificarToken,
    listarAutorizaciones
);

router.post(
    '/',
    verificarToken,
    crearAutorizacion
);

router.put(
    '/:id',
    verificarToken,
    actualizarEstado
);

router.delete(
    '/:id',
    verificarToken,
    eliminarAutorizacion
);

module.exports = router;
