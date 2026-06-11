const jwt = require('jsonwebtoken');

const verificarToken = (
    req,
    res,
    next
) => {

    const token =
        req.header('Authorization');

    if (!token) {

        return res.status(401).json({
            mensaje: 'Acceso denegado'
        });

    }

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