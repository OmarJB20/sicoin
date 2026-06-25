const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const {
    obtenerEstadisticas,
    obtenerAlertas,
    obtenerModa,
    marcarLeida
} = require('../controllers/estadisticaController');

router.get('/', verificarToken, obtenerEstadisticas);
router.get('/alertas', verificarToken, obtenerAlertas);
router.get('/moda', verificarToken, obtenerModa);
router.put('/alertas/:id/leer', verificarToken, marcarLeida);

module.exports = router;
