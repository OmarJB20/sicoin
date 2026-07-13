const express = require('express');

const router = express.Router();

const {
    register,
    registrarCliente,
    login
} = require('../controllers/authController');

router.post('/register', register);

router.post('/registrar-cliente', registrarCliente);

router.post('/login', login);

module.exports = router;