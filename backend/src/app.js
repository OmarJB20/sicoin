const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const verificarToken = require('./middlewares/authMiddleware');
const categoriaRoutes = require('./routes/categoriaRoutes');
const productoRoutes = require('./routes/productoRoutes');
const movimientoRoutes = require('./routes/movimientoRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/usuarios', usuarioRoutes);


// Ruta principal
app.get('/', (req, res) => {
    res.json({
        mensaje: 'SICOIN FUNCIONANDO CORRECTAMENTE'
    });
});

// Ruta protegida
app.get('/perfil', verificarToken, (req, res) => {
    res.json({
        mensaje: 'Acceso autorizado',
        usuario: req.usuario
    });
});

module.exports = app;