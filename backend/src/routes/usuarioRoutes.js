const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const {
    listarUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require('../controllers/usuarioController');

router.get(
    '/',
    verificarToken,
    listarUsuarios
);

router.get(
    '/:id',
    verificarToken,
    obtenerUsuario
);

router.put(
    '/:id',
    verificarToken,
    actualizarUsuario
);

router.delete(
    '/:id',
    verificarToken,
    eliminarUsuario
);

module.exports = router;