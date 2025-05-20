const MYSQLHOST = process.env.MYSQLHOST||'localhost';
const MYSQLUSER = process.env.MYSQLUSER||'jessica';
const MYSQLPASSWORD = process.env.MYSQLPASSWORD||'Jessica$1';
const MYSQLDATABASE = process.env.MYSQLDATABASE||'cine_lotus_db';
const MYSQLDATABASETEST = process.env.MYSQLDATABASETEST||'cine_lotus_testdb';
const MYSQLPORT = process.env.MYSQLPORT||3306;
const MYSQLURL = process.env.MYSQL_URL||'mysql://jessica:Jessica$1@localhost:3306/cine_lotus_db';

module.exports = {MYSQLHOST,MYSQLUSER,MYSQLPASSWORD,MYSQLDATABASE,MYSQLDATABASETEST,MYSQLPORT,MYSQLURL};