require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const c = await mysql.createConnection({
      host: process.env.DB_HOST, user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, database: process.env.DB_NAME
    });
    const [filas] = await c.query('SHOW TABLES');
    console.log('Conectado. Tablas encontradas:', filas.length);
    await c.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();