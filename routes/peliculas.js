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


//Ruta para obtener pelicula por id
router.get('/:id', authenticateToken, allowRoles('Admin'), (req,res) => {
  //Obtener los parámetros desde la llamada
  const id = parseInt(req.params.id);

  // Validación de los parámetros: asegurarse de que id sea proporcionado
  if (!id) {
      return res.status(404).json({ error: 'Debes proporcionar el id' });
  }

  //Consulta parametrizada para buscar por id y nombre
  const sqlQuery = 'SELECT * FROM pelicula WHERE idpelicula = ?';

  //Usar el pool para los resultados
  pool.query(sqlQuery,[id],(err,results)=>{
      if(err){
          console.error('Error al leer los datos de la película: ', err);
          return res.status(500).send('Error de consulta');
      }
      res.json(results[0]); //Enviar los resultados como JSON
  });
});



// Ruta para registrar una pelicula
router.post('/new', authenticateToken, allowRoles('Admin'), upload.single('file'), async (req, res) => {
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
router.put('/edit', authenticateToken, allowRoles('Admin'), upload.single('file'), async (req, res) => {
  const { idpelicula, nombre, descripcion, activa, poster } = req.body;

  

  // Validación de los parámetros: asegurarse de que nombre, poster, descripción y activa sean proporcionados
  if (!idpelicula, !nombre || !descripcion|| !activa) {
    return res.status(400).json({ error: 'Debes proporcionar id, nombre, descripcion, poster y si está activa' });
  }

  const rutaPoster = poster ? poster : req.file.filename; 

  //Consulta parametrizada para actualizar la película
  const sqlQuery = `
    UPDATE pelicula
    SET nombre = ?, descripcion = ?, activa = ?, poster=?
    WHERE idpelicula = ?
  `;


  //Usar el pool para los resultados
  pool.query(sqlQuery,[nombre,descripcion,activa,rutaPoster,idpelicula],(err,results)=>{
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
          peliculaId: idpelicula
      });
  });
});

/* GET lista de peliculas. Presenta la lista de peliculas activas*/
router.get('/api/activas', authenticateToken, allowRoles('Admin'), function(req, res, next) {
    //Consulta para retornar las peliculas del sistema
    const sqlQuery = 'SELECT idpelicula, nombre FROM pelicula where activa="Si"';
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,(err,results)=>{
      if(err){
        console.error('Error al leer las peliculas: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  });

module.exports = router;
