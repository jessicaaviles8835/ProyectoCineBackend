const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',       // Dirección de tu base de datos
    user: 'jessica',            // Usuario de la base de datos
    password: 'Jessica$1',            // Contraseña de la base de datos
    database: 'cine_lotus_db',    // Nombre de la base de datos
    waitForConnections:true, //Espera si todas las conexiones están en uso
    connectionLimit: 100, //Número máximo de conexiones simultáneas
    queueLimit:0 //Número de consultas en espera (0 significa sin límite)
  });

  module.exports = pool;