const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/authMiddleware');
const { obtenerDashboard } = require('../controllers/dashboardController');

router.get('/', verificarToken, obtenerDashboard);

module.exports = router;
