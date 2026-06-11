const categoriaModel =
require('../models/categoriaModel');

const listarCategorias = async (
    req,
    res
) => {

    try {

        const categorias =
            await categoriaModel.obtenerCategorias();

        res.json(categorias);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }
};

const obtenerCategoria = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const categoria =
            await categoriaModel.obtenerCategoriaPorId(id);

        if (!categoria) {

            return res.status(404).json({
                mensaje: 'Categoría no encontrada'
            });

        }

        res.json(categoria);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }
};

const crearCategoria = async (
    req,
    res
) => {

    try {

        const {
            nombre,
            descripcion
        } = req.body;

        const categoria =
            await categoriaModel.crearCategoria(
                nombre,
                descripcion
            );

        res.status(201).json({
            mensaje: 'Categoría creada',
            categoria
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }
};

const actualizarCategoria = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const {
            nombre,
            descripcion,
            estado
        } = req.body;

        const categoria =
            await categoriaModel.actualizarCategoria(
                id,
                nombre,
                descripcion,
                estado
            );

        res.json({
            mensaje: 'Categoría actualizada',
            categoria
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }
};

const eliminarCategoria = async (
    req,
    res
) => {

    try {

        const { id } = req.params;

        const categoria =
            await categoriaModel.eliminarCategoria(id);

        res.json({
            mensaje: 'Categoría eliminada',
            categoria
        });

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }
};

module.exports = {
    listarCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};