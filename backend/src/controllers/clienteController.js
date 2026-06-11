const bcrypt = require('bcryptjs');

const clienteModel =
require('../models/clienteModel');

const listarClientes = async (req,res) => {

    try {

        const clientes =
            await clienteModel.obtenerClientes();

        res.json(clientes);

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

const obtenerCliente = async (req,res) => {

    try {

        const { id } = req.params;

        const cliente =
            await clienteModel.obtenerClientePorId(id);

        if(!cliente){

            return res.status(404).json({
                mensaje:'Cliente no encontrado'
            });

        }

        res.json(cliente);

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

const crearCliente = async (req,res) => {

    try {

        const {
            nombre,
            apellido,
            correo,
            password,
            telefono,
            direccion
        } = req.body;

        const passwordHash =
            await bcrypt.hash(password,10);

        const cliente =
            await clienteModel.crearCliente(
                nombre,
                apellido,
                correo,
                passwordHash,
                telefono,
                direccion
            );

        res.status(201).json({
            mensaje:'Cliente creado',
            cliente
        });

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

const actualizarCliente = async (req,res) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            apellido,
            correo,
            telefono,
            direccion,
            estado
        } = req.body;

        const cliente =
            await clienteModel.actualizarCliente(
                id,
                nombre,
                apellido,
                correo,
                telefono,
                direccion,
                estado
            );

        res.json({
            mensaje:'Cliente actualizado',
            cliente
        });

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

const eliminarCliente = async (req,res) => {

    try {

        const { id } = req.params;

        const cliente =
            await clienteModel.eliminarCliente(id);

        res.json({
            mensaje:'Cliente eliminado',
            cliente
        });

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

module.exports = {
    listarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};