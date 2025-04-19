// Para verificar el rol
const allowRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
      const usuario = req.user; // viene del middleware de autenticación
  
      if (!usuario || !rolesPermitidos.includes(usuario.tipo)) {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
      }
  
      next();
    };
  };
  
  module.exports = allowRoles;