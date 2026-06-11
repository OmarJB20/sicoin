const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usuarioModel = require('../models/usuarioModel');

const register = async (req, res) => {

    console.log('====================');
    console.log('BODY RECIBIDO:');
    console.log(req.body);
    console.log('====================');

    try {

        if (!req.body) {
            return res.status(400).json({
                mensaje: 'No se recibió información en el body'
            });
        }

        const {
            nombre,
            apellido,
            correo,
            password,
            rol_id
        } = req.body;

        const existeUsuario =
            await usuarioModel.buscarPorCorreo(correo);

        if (existeUsuario) {
            return res.status(400).json({
                mensaje: 'El usuario ya existe'
            });
        }

        const passwordHash =
            await bcrypt.hash(password, 10);

        const nuevoUsuario =
            await usuarioModel.crearUsuario(
                nombre,
                apellido,
                correo,
                passwordHash,
                rol_id
            );

        res.status(201).json({
            mensaje: 'Usuario registrado',
            usuario: nuevoUsuario
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: error.message
        });

    }
};

const login = async (req, res) => {

    try {

        const { correo, password } = req.body;

        const usuario =
            await usuarioModel.buscarPorCorreo(correo);

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }

        const coincide =
            await bcrypt.compare(
                password,
                usuario.password
            );

        if (!coincide) {
            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                rol_id: usuario.rol_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '8h'
            }
        );

        res.json({
            mensaje: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol_id: usuario.rol_id
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: error.message
        });

    }
};

module.exports = {
    register,
    login
};