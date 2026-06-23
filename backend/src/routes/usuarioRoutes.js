const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const upload =
require('../middlewares/uploadMiddleware');

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
    upload.single('imagen'),
    actualizarUsuario
);

router.delete(
    '/:id',
    verificarToken,
    eliminarUsuario
);

module.exports = router;