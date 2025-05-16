var express = require('express');
var router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authentication');
const allowRoles = require('../middleware/authorization');

/* GET lista de peliculas en cartelera. Presenta la lista de las peliculas que están exhibiendose*/
router.get('/', function(req, res, next) {
    //Consulta para retornar las salas del sistema
    const sqlQuery = `SELECT DISTINCT p.idpelicula AS id, p.nombre AS nombrePelicula, p.poster, p.descripcion AS descripcionPelicula FROM cartelera c
                      INNER JOIN pelicula p ON c.idpelicula=p.idpelicula
                      INNER JOIN sala s ON c.idsala=s.idsala
                      WHERE c.activa = "Si"
                      AND c.fecha >= DATE(NOW())`;
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,(err,results)=>{
      if(err){
        console.error('Error al leer la cartelera: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  });


/* GET lista de peliculas en cartelera. Presenta la lista de las peliculas que están en la bc*/
router.get('/cartelera', authenticateToken, allowRoles('Admin'), function(req, res, next) {
    //Consulta para retornar las salas del sistema
    const sqlQuery = `SELECT DISTINCT c.idcartelera AS id, p.nombre AS pelicula, c.fecha as fechaFuncion, s.nombre as sala, c.activa FROM cartelera c
                      INNER JOIN pelicula p ON c.idpelicula=p.idpelicula
                      INNER JOIN sala s ON c.idsala=s.idsala`;
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,(err,results)=>{
      if(err){
        console.error('Error al leer la cartelera: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  }); 


function getFechasEntre(inicio, fin) {
  const fechas = [];
  let actual = new Date(inicio);
  const finDate = new Date(fin);

  while (actual <= finDate) {
    fechas.push(actual.toISOString().slice(0, 10)); // YYYY-MM-DD
    actual.setDate(actual.getDate() + 1);
  }

  return fechas;
}

// Ruta para registrar una entrada en la cartelera
router.post('/new', authenticateToken, allowRoles('Admin'), async (req, res) => {
  const { sala, pelicula, fechaI, fechaF } = req.body;
  const idUsuario = req.user.id;
  

  // Validación de los parámetros: asegurarse de que la sala, la película y las fechas sean proporcionados
  if (!sala || !pelicula || !fechaI || !fechaF) {
    return res.status(400).json({ error: 'Debes proporcionar la sala, la película y la fecha' });
  }

  const fechas = getFechasEntre(fechaI, fechaF);

  const valores = fechas.map(fecha => [sala, pelicula, fecha, idUsuario]);


  //Consulta parametrizada para insertar nueva entrada de la cartelera
  const sqlQuery = 'INSERT IGNORE INTO cartelera (idsala, idpelicula, fecha, usuariocreacion) VALUES ?';

  //Usar el pool para los resultados
  pool.query(sqlQuery,[valores],(err,results)=>{
      if(err){
          console.error('Error al agregar la pelicula en la cartelera: ', err);
          if(err.code=='ER_DUP_ENTRY'){
            return res.status(500).send({message:'Esta entrada ya existe', code:err.code, id:err.errno, description:err.message});
          }
          else{
            return res.status(500).send({message:'Error al agregar la pelicula en la cartelera', code:err.code, id:err.errno, description:err.message});
          }  
      }
      res.status(201).json({
          message:'Película agregada con éxito a la cartelera',
          carteleraId: results.insertId
      });
  });
});


// Ruta para registrar una nueva entrada de la cartelera
router.put('/edit', authenticateToken, allowRoles('Admin'), async (req, res) => {
  const { id, idSala, idPelicula, fecha, activa } = req.body;
  

  // Validación de los parámetros: asegurarse de que id, la sala, la película, la fecha y activa sean proporcionados
  if (!id, !idSala || !idPelicula || !fecha || !activa) {
    return res.status(400).json({ error: 'Debes proporcionar id, sala, pelicula, fecha y si está activa' });
  }

  //Consulta parametrizada para insertar nueva sala
  const sqlQuery = `
    UPDATE cartelera
    SET idSala = ?, idPelicula = ?, fecha = ?, activa = ?
    WHERE idcartelera = ?
  `;


  //Usar el pool para los resultados
  pool.query(sqlQuery,[idSala,idPelicula,fecha,activa,id],(err,results)=>{
      if(err){
          console.error('Error al actualizar la película en la cartelera: ', err);
          if(err.code=='ER_DUP_ENTRY'){
            return res.status(500).send({message:'Este registro ya está duplicado', code:err.code, id:err.errno, description:err.message});
          }
          else{
            return res.status(500).send({message:'Error al actualizar la cartelera', code:err.code, id:err.errno, description:err.message});
          }  
      }
      if(results.affectedRows==0){
        return res.status(404).json({ error: 'Película no encontrada en la cartelera' });
      }
      res.json({
          message:'Cartelera actualizada con éxito',
          carteleraId: id
      });
  });
});

module.exports = router;
