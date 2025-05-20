const mysql = require('mysql2');
const { MYSQLHOST, MYSQLUSER, MYSQLPASSWORD,MYSQLDATABASE,MYSQLDATABASETEST,MYSQLPORT } = require('./config');

const config = {
  development: {
    host: MYSQLHOST,
    port:MYSQLPORT,
    user: MYSQLUSER,
    password: MYSQLPASSWORD,
    database: MYSQLDATABASE, // base real
    waitForConnections:true, //Espera si todas las conexiones están en uso
    connectionLimit: 100, //Número máximo de conexiones simultáneas
    queueLimit:0 //Número de consultas en espera (0 significa sin límite)
  },
  test: {
    host: MYSQLHOST,
    port:MYSQLPORT,
    user: MYSQLUSER,
    password: MYSQLPASSWORD,
    database: MYSQLDATABASETEST, // base pruebas
    waitForConnections:true, //Espera si todas las conexiones están en uso
    connectionLimit: 100, //Número máximo de conexiones simultáneas
    queueLimit:0 //Número de consultas en espera (0 significa sin límite)
  }
};

const env = process.env.NODE_ENV || 'development';

const pool = mysql.createPool(config[env]);

module.exports = pool;