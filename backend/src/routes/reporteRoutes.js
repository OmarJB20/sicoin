const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const {
    masVendidos
} = require('../controllers/reporteController');

router.get(
    '/productos-mas-vendidos',
    verificarToken,
    masVendidos
);

module.exports = router;
