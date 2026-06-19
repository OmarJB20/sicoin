const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const {
    listarRoles,
    obtenerRol
} = require('../controllers/rolController');

router.get(
    '/',
    verificarToken,
    listarRoles
);

router.get(
    '/:id',
    verificarToken,
    obtenerRol
);

module.exports = router;
