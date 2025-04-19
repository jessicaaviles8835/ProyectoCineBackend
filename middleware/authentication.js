const jwt = require('jsonwebtoken');
require('dotenv').config();

// Para verificar el token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Acceso denegado, no tiene permisos' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Acceso denegado, no tiene permisos' });
      }
      req.user = user;
      next();
    });
  };

  module.exports = authenticateToken;