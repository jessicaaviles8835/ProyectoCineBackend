var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const pool = require('../db');
const authenticateToken = require('../middleware/authentication');
const allowRoles = require('../middleware/authorization');


/* GET users listing. Presenta la lista de usuarios registrados*/
router.get('/', authenticateToken, allowRoles('Admin'), function(req, res, next) {
  //Consulta para retornar los usuarios del sistema
  const sqlQuery = 'SELECT idusuario as id, nombre, email, tipo, activo, fecha_creacion FROM usuario';

  //Usar el pool para los resultados
  pool.query(sqlQuery,(err,results)=>{
    if(err){
      console.error('Error al leer los usuarios: ', err);
      return res.status(500).send('Error de consulta');
    }
    res.json(results); //Enviar los resultados como JSON
  });
});

// Ruta para registrar un usuario
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validación de los parámetros: asegurarse de que nombre, password y el email sean proporcionados
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Debes proporcionar nombre, correo electrónico y una contraseña' });
  }

  // Verifica si el usuario ya existe en la base de datos
  const resultadoVerificarUsuario = await verificarUsuario(username);  // Esperar la respuesta de la función
  if(resultadoVerificarUsuario){
    return res.status(404).json({ error: 'Este nombre de usuario ya existe en la base de datos' });
  }

  // Hashear la contraseña para guardar el hashed frase en la base de datos
  const hashedPassword = await bcrypt.hash(password, 10);

  //Consulta parametrizada para insertar nuevo usuario
  const sqlQuery = 'INSERT INTO usuario (nombre, email, contrasena) VALUES (?,?,?)';

  //Usar el pool para los resultados
  pool.query(sqlQuery,[username,email,hashedPassword],(err,results)=>{
      if(err){
          console.error('Error al agregar el usuario: ', err);
          return res.status(500).send('Error al agregar el usuario');
      }
      res.status(201).json({
          message:'Usuario agregado con éxito',
          usuarioId: results.insertId
      });
  });
});


// Ruta para registrar un nuevo usuario
router.post('/new', authenticateToken, allowRoles('Admin'),async (req, res) => {
  const { username, email, password, tipo, activo } = req.body;

  // Validación de los parámetros: asegurarse de que nombre, password, tipo, activo y el email sean proporcionados
  if (!username || !email || !password || !tipo || !activo) {
    return res.status(400).json({ error: 'Debes proporcionar nombre, correo electrónico, tipo de usuario, activo y una contraseña' });
  }

  // Verifica si el usuario ya existe en la base de datos
  const resultadoVerificarUsuario = await verificarUsuario(username);  // Esperar la respuesta de la función
  if(resultadoVerificarUsuario){
    return res.status(404).json({ error: 'Este nombre de usuario ya existe en la base de datos' });
  }

  // Hashear la contraseña para guardar el hashed frase en la base de datos
  const hashedPassword = await bcrypt.hash(password, 10);

  //Consulta parametrizada para insertar nuevo usuario
  const sqlQuery = 'INSERT INTO usuario (nombre, email, contrasena, tipo, activo) VALUES (?,?,?,?,?)';

  //Usar el pool para los resultados
  pool.query(sqlQuery,[username,email,hashedPassword,tipo,activo],(err,results)=>{
      if(err){
          console.error('Error al agregar el usuario: ', err);
          return res.status(500).send('Error al agregar el usuario');
      }
      res.status(201).json({
          message:'Usuario agregado con éxito',
          usuarioId: results.insertId
      });
  });
});

//Validacion que el nombre de usuario existe
async function verificarUsuario(username) {
  return new Promise((resolve, reject) => {
      const sqlQueryVerificarUsuarios = 'SELECT idusuario, nombre,contrasena,tipo,activo FROM usuario WHERE nombre = ?';
      pool.query(sqlQueryVerificarUsuarios,[username],(err,results)=>{
          if(err){
              console.error('Error al verificar al usuario: ', err);
              return reject(err);
          }
          else {
              if(results.length>0){
                  usuario = results[0];
                  resolve(true);
              }
              else{
                  resolve(false);
              }
          }
      });
  });
}

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validación de los parámetros: asegurarse de que nombre y password sean proporcionados
  if (!username || !password) {
    return res.status(400).json({ error: 'Debes proporcionar nombre y una contraseña' });
  }
  //Validacion que el usuario existe
  try {
    const resultadoVerificarUsuario = await verificarUsuario(username);  // Esperar la respuesta de la función
    if(!resultadoVerificarUsuario){
        return res.status(401).json({ error: 'Este usuario no existe' });
    }
    
  } catch (error) {
    return res.status(500).send(error.message);  // Manejo de errores
  }

  // Verificar la contraseña
  const validPassword = await bcrypt.compare(password, usuario.contrasena);
  if (!validPassword) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }

  // Verificar si está activo
  if (usuario.activo != 'Si') {
    return res.status(401).json({ message: 'Usuario está inactivo' });
  }

  // Crear el token JWT
  const token = jwt.sign({ id:usuario.idusuario, username: usuario.nombre, tipo:usuario.tipo }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});


// Ruta protegida (requiere autenticación)
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.username}` });
});

module.exports = router;
