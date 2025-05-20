const MYSQLHOST = process.env.MYSQLHOST||'localhost';
const MYSQLUSER = process.env.MYSQLUSER||'jessica';
const MYSQLPASSWORD = process.env.MYSQLPASSWORD||'Jessica$1';
const MYSQLDATABASE = process.env.MYSQLDATABASE||'cine_lotus_db';
const MYSQLDATABASETEST = process.env.MYSQLDATABASETEST||'cine_lotus_testdb';
const MYSQLPORT = process.env.MYSQLPORT||3306;

module.exports = {MYSQLHOST,MYSQLUSER,MYSQLPASSWORD,MYSQLDATABASE,MYSQLDATABASETEST,MYSQLPORT};