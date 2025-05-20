var express = require('express');
var router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authentication');
const allowRoles = require('../middleware/authorization');

/* GET lista de salas. Presenta la lista de salas registradas en el sistema*/
router.get('/', authenticateToken, allowRoles('Admin'), function(req, res, next) {
    //Consulta para retornar las salas del sistema
    const sqlQuery = 'SELECT idsala, nombre, capacidad, activa, fechacreacion FROM sala';
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,(err,results)=>{
      if(err){
        console.error('Error al leer las salas: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  });

//Ruta para obtener sala por id
router.get('/:id', authenticateToken, allowRoles('Admin'), (req,res) => {
  //Obtener los parámetros desde la llamada
  const id = parseInt(req.params.id);

  // Validación de los parámetros: asegurarse de que id sea proporcionado
  if (!id) {
      return res.status(404).json({ error: 'Debes proporcionar el id' });
  }

  //Consulta parametrizada para buscar por id y nombre
  const sqlQuery = 'SELECT * FROM sala WHERE idsala = ?';

  //Usar el pool para los resultados
  pool.query(sqlQuery,[id],(err,results)=>{
      if(err){
          console.error('Error al leer los datos de la sala: ', err);
          return res.status(500).send('Error de consulta');
      }
      res.json(results[0]); //Enviar los resultados como JSON
  });
});


// Ruta para registrar una sala
router.post('/new', authenticateToken, allowRoles('Admin'), async (req, res) => {
  const { nombre, filas, columnas } = req.body;
  const idUsuario = req.user.id;
  

  // Validación de los parámetros: asegurarse de que nombre, filas y columnas sean proporcionados
  if (!nombre || !filas || !columnas) {
    return res.status(400).json({ error: 'Debes proporcionar nombre, filas y columnas' });
  }
  //Calcular la capacidad de la sala
  const capacidad = filas * columnas;

  //Consulta parametrizada para insertar nueva sala
  const sqlQuery = 'INSERT INTO sala (nombre, filas, columnas, capacidad, usuariocreacion) VALUES (?,?,?,?,?)';

  //Usar el pool para los resultados
  pool.query(sqlQuery,[nombre,filas,columnas,capacidad,idUsuario],(err,results)=>{
      if(err){
          console.error('Error al agregar la sala: ', err);
          if(err.code=='ER_DUP_ENTRY'){
            return res.status(500).send({message:'El nombre de sala ya existe', code:err.code, id:err.errno, description:err.message});
          }
          else{
            return res.status(500).send({message:'Error al agregar la sala', code:err.code, id:err.errno, description:err.message});
          }  
      }
      res.status(201).json({
          message:'Sala agregada con éxito',
          salaId: results.insertId
      });
  });
});


// Ruta para editar una sala
router.put('/edit', authenticateToken, allowRoles('Admin'), async (req, res) => {
  const { id, nombre, filas, columnas, activa } = req.body;
  

  // Validación de los parámetros: asegurarse de que nombre, filas , columnas y activa sean proporcionados
  if (!id, !nombre || !filas || !columnas || !activa) {
    return res.status(400).json({ error: 'Debes proporcionar id, nombre, filas, columnas y si está activa' });
  }
  //Calcular la capacidad de la sala
  const capacidad = filas * columnas;

  //Consulta parametrizada para editar sala
  const sqlQuery = `
    UPDATE sala
    SET nombre = ?, filas = ?, columnas = ?, capacidad = ?, activa = ?
    WHERE idsala = ?
  `;


  //Usar el pool para los resultados
  pool.query(sqlQuery,[nombre,filas,columnas,capacidad,activa,id],(err,results)=>{
      if(err){
          console.error('Error al actualizar la sala: ', err);
          if(err.code=='ER_DUP_ENTRY'){
            return res.status(500).send({message:'El nombre de sala ya existe', code:err.code, id:err.errno, description:err.message});
          }
          else{
            return res.status(500).send({message:'Error al actualizar la sala', code:err.code, id:err.errno, description:err.message});
          }  
      }
      if(results.affectedRows==0){
        return res.status(404).json({ error: 'Sala no encontrada' });
      }
      res.status(200).json({
          message:'Sala actualizada con éxito',
          salaId: id
      });
  });
});

/* GET lista de salas. Presenta la lista de salas activas*/
router.get('/api/activas', authenticateToken, allowRoles('Admin'), function(req, res, next) {
    //Consulta para retornar las peliculas del sistema
    const sqlQuery = 'SELECT idsala, nombre FROM sala where activa="Si"';
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,(err,results)=>{
      if(err){
        console.error('Error al leer las salas: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  });

module.exports = router;
