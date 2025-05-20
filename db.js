const mysql = require('mysql2');
const parametros = require('./config');

const config = {
  development: {
    host: parametros.DB_HOST,
    port:parametros.DB_PORT,
    user: parametros.DB_USER,
    password: parametros.DB_PASSWORD,
    database: parametros.DB_NAME, // base real
    waitForConnections:true, //Espera si todas las conexiones están en uso
    connectionLimit: 100, //Número máximo de conexiones simultáneas
    queueLimit:0 //Número de consultas en espera (0 significa sin límite)
  },
  test: {
    host: parametros.DB_HOST,
    port:parametros.DB_PORT,
    user: parametros.DB_USER,
    password: parametros.DB_PASSWORD,
    database: parametros.DB_NAME_TEST, // base pruebas
    waitForConnections:true, //Espera si todas las conexiones están en uso
    connectionLimit: 100, //Número máximo de conexiones simultáneas
    queueLimit:0 //Número de consultas en espera (0 significa sin límite)
  }
};

const env = process.env.NODE_ENV || 'development';

const pool = mysql.createPool(config[env]);

module.exports = pool;