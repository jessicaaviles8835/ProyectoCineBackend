const DB_HOST = process.env.DB_HOST||'localhost';
const DB_USER = process.env.DB_USER||'jessica';
const DB_PASSWORD = process.env.DB_PASSWORD||'Jessica$1';
const DB_NAME = process.env.DB_NAME||'cine_lotus_db';
const DB_NAME_TEST = process.env.DB_NAME_TEST||'cine_lotus_testdb';
const DB_PORT = process.env.DB_PORT||3306;

module.exports = {DB_HOST,DB_USER,DB_PORT,DB_PASSWORD,DB_NAME,DB_NAME_TEST};