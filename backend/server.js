require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/config/db');

pool.connect()
  .then(() => {
    console.log('Base de datos conectada');
  })
  .catch(err => {
    console.error('Error de conexión:',err);
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});