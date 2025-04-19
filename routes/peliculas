var express = require('express');
var router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authentication');
const allowRoles = require('../middleware/authorization');
const upload = require('../middleware/upload');

/* GET lista de peliculas. Presenta la lista de peliculas registradas en el sistema*/
router.get('/', authenticateToken, allowRoles('Admin'), function(req, res, next) {
    //Consulta para retornar las peliculas del sistema
    const sqlQuery = 'SELECT idpelicula, nombre, poster, descripcion, fechacreacion, activa FROM pelicula';
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,(err,results)=>{
      if(err){
        console.error('Error al leer las peliculas: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  });


// Ruta para registrar una pelicula
router.post('/new', authenticateToken, allowRoles('Admin'), upload.single('poster'), async (req, res) => {
  const { nombre, descripcion } = req.body;
  const idUsuario = req.user.id;
  

  // Validación de los parámetros: asegurarse de que nombre, poster y descripción sean proporcionados
  if (!nombre || !descripcion || !req.file) {
    return res.status(400).json({ error: 'Debes proporcionar nombre, poster y descripcion'});
  }

  const rutaPoster = req.file.filename;

  //Consulta parametrizada para insertar nueva pelicula
  const sqlQuery = 'INSERT INTO pelicula (nombre, poster, descripcion, usuariocreacion) VALUES (?,?,?,?)';

  //Usar el pool para los resultados
  pool.query(sqlQuery,[nombre,rutaPoster,descripcion,idUsuario],(err,results)=>{
      if(err){
          console.error('Error al agregar la pelicula: ', err);
          if(err.code=='ER_DUP_ENTRY'){
            return res.status(500).send({message:'El nombre de pelicula ya existe', code:err.code, id:err.errno, description:err.message});
          }
          else{
            return res.status(500).send({message:'Error al agregar la pelicula', code:err.code, id:err.errno, description:err.message});
          }  
      }
      res.status(201).json({
          message:'Película agregada con éxito',
          salaId: results.insertId
      });
  });
});


// Ruta para actualizar una Película
router.put('/edit', authenticateToken, allowRoles('Admin'), async (req, res) => {
  const { id, nombre, descripcion, activa } = req.body;
  

  // Validación de los parámetros: asegurarse de que nombre, poster, descripción y activa sean proporcionados
  if (!id, !nombre || !descripcion|| !activa) {
    return res.status(400).json({ error: 'Debes proporcionar id, nombre, descripcion y si está activa' });
  }

  //Consulta parametrizada para actualizar la película
  const sqlQuery = `
    UPDATE pelicula
    SET nombre = ?, descripcion = ?, activa = ?
    WHERE idpelicula = ?
  `;


  //Usar el pool para los resultados
  pool.query(sqlQuery,[nombre,descripcion,activa,id],(err,results)=>{
      if(err){
          console.error('Error al actualizar la pelicula: ', err);
          if(err.code=='ER_DUP_ENTRY'){
            return res.status(500).send({message:'El nombre de pelicula ya existe', code:err.code, id:err.errno, description:err.message});
          }
          else{
            return res.status(500).send({message:'Error al actualizar la película', code:err.code, id:err.errno, description:err.message});
          }  
      }
      if(results.affectedRows==0){
        return res.status(404).json({ error: 'Película no encontrada' });
      }
      res.json({
          message:'Película actualizada con éxito',
          peliculaId: id
      });
  });
});

module.exports = router;
