const mysql = require('mysql2');

const dbConfig = {
  host: '192.168.88.142',
  user: 'pm_entel',
  password: 'pm_entel',
  database: 'PM_ENTEL',
  waitForConnections: true,
  connectionLimit: 30,  // Límite de conexiones simultáneas
  queueLimit: 0         // No hay límite para la cola de conexiones
};

const pool = mysql.createPool(dbConfig);



module.exports = pool;
