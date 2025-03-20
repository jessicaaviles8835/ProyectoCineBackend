var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const users = []; // Cambiar por la base de datos

/* GET users listing. Presenta la lista de usuarios registrados*/
router.get('/', function(req, res, next) {
  res.send(users);
});

// Ruta para registrar un usuario
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  // Verifica si el usuario ya existe en la base de datos
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(400).json({ message: 'El usuario ya existe' });
  }

  // Hashear la contraseña para guardar el hashed frase en la base de datos
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear y almacenar el nuevo usuario
  const newUser = { username, email, password: hashedPassword, role };
  users.push(newUser);

  res.status(201).json({ message: 'Usuario registrado' });
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Buscar el usuario
  const user = users.find(user => user.username === username);
  if (!user) {
    return res.status(400).json({ message: 'Usuario no encontrado' });
  }

  // Verificar la contraseña
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Contraseña incorrecta' });
  }

  // Crear el token JWT
  const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

// Para verificar el token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido' });
    }
    req.user = user;
    next();
  });
};

// Ruta protegida (requiere autenticación)
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.username}` });
});

module.exports = router;
