const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { obtenerDashboard, obtenerDashboardCliente } = require('../controllers/dashboardController');

router.get('/', verificarToken, obtenerDashboard);
router.get('/cliente', verificarToken, obtenerDashboardCliente);

module.exports = router;
