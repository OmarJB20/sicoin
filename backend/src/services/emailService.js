const nodemailer = require('nodemailer');
const {
    generarFacturaPDF
} = require('./pdfService');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS.replace(/\s/g, '')
    }
});

const verificarConexion = async () => {

    try {

        await transporter.verify();
        console.log('SMTP: Conexión verificada correctamente');

    } catch (error) {

        console.error('SMTP: Error de conexión -', error.message);

    }

};

verificarConexion();

const enviarFacturaPDF = async (factura, detalles) => {

    console.log(`Email: Preparando envío de factura #${factura.id} a ${factura.correo}`);

    try {

        const pdfBuffer = await generarFacturaPDF(
            factura,
            detalles
        );

        console.log(`Email: PDF generado (${pdfBuffer.length} bytes)`);

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: factura.correo,
            subject: `Factura #${factura.id} - SICOIN`,
            text: `Estimado/a ${factura.nombre_cliente},\n\nAdjunto encontrará su factura #${factura.id}.\n\nGracias por su compra.\n\nSICOIN`,
            attachments: [
                {
                    filename: `factura-${factura.id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`Email: Enviado correctamente - ${info.messageId}`);

        return info;

    } catch (error) {

        console.error(`Email: Error al enviar factura #${factura.id} -`, error.message);
        throw error;

    }

};

module.exports = {
    enviarFacturaPDF
};
