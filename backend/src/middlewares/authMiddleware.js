const jwt = require('jsonwebtoken');

const verificarToken = (
    req,
    res,
    next
) => {

    const authHeader =
        req.header('Authorization');

    if (!authHeader) {

        return res.status(401).json({
            mensaje: 'Acceso denegado'
        });

    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    try {

        const verified =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.usuario = verified;

        next();

    } catch (error) {

        res.status(401).json({
            mensaje: 'Token inválido'
        });

    }
};

module.exports = verificarToken;