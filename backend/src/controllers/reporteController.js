const reporteModel =
require('../models/reporteModel');

const masVendidos = async (
    req,
    res
) => {

    try {

        const {
            desde,
            hasta
        } = req.query;

        const datos =
            await reporteModel.obtenerMasVendidos(
                desde,
                hasta
            );

        res.json(datos);

    } catch (error) {

        res.status(500).json({
            mensaje: error.message
        });

    }

};

module.exports = {
    masVendidos
};
