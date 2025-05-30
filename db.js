const mysql = require('mysql2');
const parametros = require('./config');

const config = {
  development: {
    host: 'localhost',       // Dirección de tu base de datos
    user: 'root',            // Usuario de la base de datos
    password: 'Jinrigoblin7883$',            // Contraseña de la base de datos
    database: 'cine_lotus_db',    // Nombre de la base de datos
    waitForConnections:true, //Espera si todas las conexiones están en uso
    connectionLimit: 100, //Número máximo de conexiones simultáneas
    queueLimit:0 //Número de consultas en espera (0 significa sin límite)
  },
  test: {
    host: 'localhost',       // Dirección de tu base de datos
    user: 'root',            // Usuario de la base de datos
    password: 'Jinrigoblin7883$',            // Contraseña de la base de datos
    database: 'cine_lotus_testdb',    // Nombre de la base de datos // 
    waitForConnections:true, //Espera si todas las conexiones están en uso
    connectionLimit: 100, //Número máximo de conexiones simultáneas
    queueLimit:0 //Número de consultas en espera (0 significa sin límite)
  }
};

const env = process.env.NODE_ENV || 'development';

const pool = mysql.createPool(config[env]);

module.exports = pool;