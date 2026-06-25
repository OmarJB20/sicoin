const estadisticaModel = require('../models/estadisticaModel');

const obtenerEstadisticas = async (req, res) => {
    try {
        const datos = await estadisticaModel.obtenerEstadisticasStock();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

const obtenerAlertas = async (req, res) => {
    try {
        const alertasCalculadas = await estadisticaModel.obtenerAlertasStock();

        for (const a of alertasCalculadas) {
            const existe = await estadisticaModel.existeAlertaPendiente(a.id);
            if (!existe) {
                await estadisticaModel.insertarAlerta(
                    a.id,
                    a.nivel_alerta,
                    a.stock,
                    a.promedio_diario,
                    a.stock_minimo_sugerido,
                    a.mensaje
                );
            }
        }

        const pendientes = await estadisticaModel.obtenerAlertasPendientes();
        res.json(pendientes);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

const obtenerModa = async (req, res) => {
    try {
        const datos = await estadisticaModel.obtenerModaVentas();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

const marcarLeida = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await estadisticaModel.marcarAlertaLeida(id);
        if (!resultado) {
            return res.status(404).json({ mensaje: 'Alerta no encontrada' });
        }
        res.json({ mensaje: 'Alerta marcada como leída' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

module.exports = {
    obtenerEstadisticas,
    obtenerAlertas,
    obtenerModa,
    marcarLeida
};
