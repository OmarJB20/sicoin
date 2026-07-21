const PDFDocument = require('pdfkit');

const generarFacturaPDF = (factura, detalles) => {

    return new Promise((resolve, reject) => {

        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });

        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.fontSize(20).font('Helvetica-Bold').text('SICOIN', {
            align: 'center'
        });

        doc.fontSize(10).font('Helvetica').text('Sistema de Inventario y Control', {
            align: 'center'
        });

        doc.moveDown(2);

        doc.fontSize(14).font('Helvetica-Bold').text('FACTURA', {
            align: 'center'
        });

        doc.moveDown();

        doc.fontSize(10).font('Helvetica-Bold').text(`Factura #${factura.id}`);
        doc.font('Helvetica').text(`Fecha: ${new Date(factura.fecha).toLocaleDateString('es-EC')}`);
        doc.text(`Estado: ${factura.estado}`);
        doc.text(`Método de pago: ${factura.metodo_pago}`);

        doc.moveDown();

        doc.fontSize(12).font('Helvetica-Bold').text('Datos del Cliente');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Nombre: ${factura.nombre_cliente}`);
        doc.text(`Cédula/RUC: ${factura.cedula_ruc}`);
        doc.text(`Dirección: ${factura.direccion}`);
        doc.text(`Correo: ${factura.correo}`);
        doc.text(`Teléfono: ${factura.telefono}`);

        doc.moveDown();

        doc.fontSize(12).font('Helvetica-Bold').text('Detalle de Productos');

        doc.moveDown();

        const tableTop = doc.y;
        const colWidths = [250, 80, 80, 90];
        const headers = ['Producto', 'Precio', 'Cantidad', 'Subtotal'];

        let x = 50;

        doc.fontSize(10).font('Helvetica-Bold');

        headers.forEach((header, i) => {
            doc.text(header, x, tableTop, {
                width: colWidths[i],
                align: i === 0 ? 'left' : 'right'
            });
            x += colWidths[i];
        });

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        let y = tableTop + 25;

        doc.font('Helvetica').fontSize(10);

        let subtotalGeneral = 0;

        detalles.forEach((detalle) => {
            x = 50;

            const subtotal = parseFloat(detalle.precio_unitario) * parseInt(detalle.cantidad);
            subtotalGeneral += subtotal;

            doc.text(detalle.producto || 'Producto', x, y, {
                width: colWidths[0],
                align: 'left'
            });

            doc.text(`$${parseFloat(detalle.precio_unitario).toFixed(2)}`, x + colWidths[0], y, {
                width: colWidths[1],
                align: 'right'
            });

            doc.text(`${detalle.cantidad}`, x + colWidths[0] + colWidths[1], y, {
                width: colWidths[2],
                align: 'right'
            });

            doc.text(`$${subtotal.toFixed(2)}`, x + colWidths[0] + colWidths[1] + colWidths[2], y, {
                width: colWidths[3],
                align: 'right'
            });

            y += 20;
        });

        doc.moveTo(50, y).lineTo(550, y).stroke();

        y += 15;

        doc.fontSize(12).font('Helvetica-Bold');

        doc.text('Total:', 350, y, {
            width: 80,
            align: 'right'
        });

        doc.text(`$${parseFloat(factura.total || subtotalGeneral).toFixed(2)}`, 430, y, {
            width: 120,
            align: 'right'
        });

        y += 40;

        doc.fontSize(8).font('Helvetica').fillColor('gray');
        doc.text('Gracias por su compra', 50, y, {
            align: 'center'
        });

        doc.end();

    });

};

module.exports = {
    generarFacturaPDF
};
