const mysql = require('mysql2');
const { MYSQLURL } = require('./config');

const pool = mysql.createPool(MYSQLURL);

module.exports = pool;