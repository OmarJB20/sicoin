const { Pool } = require('pg');
const pg = require('pg');
pg.types.setTypeParser(20, (val) => parseInt(val, 10));
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

module.exports = pool;