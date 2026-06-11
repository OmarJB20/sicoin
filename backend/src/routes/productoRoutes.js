const express = require('express');

const router = express.Router();

const verificarToken =
require('../middlewares/authMiddleware');

const {
    listarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController');

router.get('/', verificarToken, listarProductos);

router.get('/:id', verificarToken, obtenerProducto);

router.post('/', verificarToken, crearProducto);

router.put('/:id', verificarToken, actualizarProducto);

router.delete('/:id', verificarToken, eliminarProducto);

module.exports = router;