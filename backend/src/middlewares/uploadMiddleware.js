const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png)$/i;
    if (allowed.test(path.extname(file.originalname))) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes JPG/PNG'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

module.exports = upload;
