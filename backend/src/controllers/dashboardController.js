const dashboardModel = require('../models/dashboardModel');

const obtenerDashboard = async (req, res) => {
    try {
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        const ventasSemanales = await dashboardModel.obtenerVentasSemanales();
        const ventasSemanalesConNombre = ventasSemanales.map(v => ({
            dia: Number(v.dia),
            nombre: diasSemana[Number(v.dia)],
            total: Number(v.total)
        }));

        const ventasPorCategoria = await dashboardModel.obtenerVentasPorCategoria();
        const totalGeneral = ventasPorCategoria.reduce((sum, c) => sum + Number(c.total), 0);
        const ventasPorCategoriaConPct = ventasPorCategoria.map(c => ({
            categoria: c.categoria,
            total: Number(c.total),
            porcentaje: totalGeneral > 0 ? Math.round((Number(c.total) / totalGeneral) * 100) : 0
        }));

        const resumen = await dashboardModel.obtenerResumen();

        res.json({
            resumen,
            ventasSemanales: ventasSemanalesConNombre,
            ventasPorCategoria: ventasPorCategoriaConPct
        });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

module.exports = { obtenerDashboard };
