const productoModel =
require('../models/productoModel');

const listarProductos = async (req,res) => {

    try {

        const productos =
            await productoModel.obtenerProductos();

        res.json(productos);

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

const obtenerProducto = async (req,res) => {

    try {

        const { id } = req.params;

        const producto =
            await productoModel.obtenerProductoPorId(id);

        if(!producto){

            return res.status(404).json({
                mensaje:'Producto no encontrado'
            });

        }

        res.json(producto);

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

const crearProducto = async (req,res) => {

    try {

        const {
            categoria_id,
            nombre,
            descripcion,
            precio,
            stock,
            stock_minimo,
            imagen
        } = req.body;

        const producto =
            await productoModel.crearProducto(
                categoria_id,
                nombre,
                descripcion,
                precio,
                stock,
                stock_minimo,
                imagen
            );

        res.status(201).json({
            mensaje:'Producto creado',
            producto
        });

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

const actualizarProducto = async (req,res) => {

    try {

        const { id } = req.params;

        const {
            categoria_id,
            nombre,
            descripcion,
            precio,
            stock,
            stock_minimo,
            imagen,
            estado
        } = req.body;

        const producto =
            await productoModel.actualizarProducto(
                id,
                categoria_id,
                nombre,
                descripcion,
                precio,
                stock,
                stock_minimo,
                imagen,
                estado
            );

        res.json({
            mensaje:'Producto actualizado',
            producto
        });

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

const eliminarProducto = async (req,res) => {

    try {

        const { id } = req.params;

        const producto =
            await productoModel.eliminarProducto(id);

        res.json({
            mensaje:'Producto eliminado',
            producto
        });

    } catch(error){

        res.status(500).json({
            mensaje:error.message
        });

    }

};

module.exports = {
    listarProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};