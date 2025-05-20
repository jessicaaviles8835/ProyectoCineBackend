const mysql = require('mysql2');
const { DB_HOST, DB_USER, DB_PORT,DB_PASSWORD,DB_NAME,DB_NAME_TEST } = require('./config');

const config = {
  development: {
    host: DB_HOST,
    port:DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME, // base real
    waitForConnections:true, //Espera si todas las conexiones están en uso
    connectionLimit: 100, //Número máximo de conexiones simultáneas
    queueLimit:0 //Número de consultas en espera (0 significa sin límite)
  },
  test: {
    host: DB_HOST,
    port:DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME_TEST, // base pruebas
    waitForConnections:true, //Espera si todas las conexiones están en uso
    connectionLimit: 100, //Número máximo de conexiones simultáneas
    queueLimit:0 //Número de consultas en espera (0 significa sin límite)
  }
};

const env = process.env.NODE_ENV || 'development';

const pool = mysql.createPool(config[env]);

module.exports = pool;