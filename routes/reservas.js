var express = require('express');
var router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authentication');
const allowRoles = require('../middleware/authorization');


/* GET lista de fechas disponibles en cartelera*/
router.get('/step1/:id', authenticateToken, allowRoles('Admin', 'Cliente'), function(req, res, next) {
    //Obtener los parámetros desde la llamada
    const id = parseInt(req.params.id);
    //Consulta para retornar las fechas disponibles de la pelicula
    const sqlQuery = `SELECT DISTINCT p.idpelicula AS id, p.nombre AS nombrePelicula, p.poster, p.descripcion AS descripcionPelicula, c.fecha FROM cartelera c
                        INNER JOIN pelicula p ON c.idpelicula=p.idpelicula
                        INNER JOIN sala s ON c.idsala=s.idsala
                        WHERE c.activa = "Si" AND c.fecha >= DATE(NOW()) AND p.idpelicula = ?
                        ORDER BY c.fecha`;
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,[id],(err,results)=>{
      if(err){
        console.error('Error al leer la cartelera: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  });

  /* GET lista de fechas disponibles en cartelera*/
router.get('/step2/:id/:fecha', authenticateToken, allowRoles('Admin', 'Cliente'), function(req, res, next) {
    //Obtener los parámetros desde la llamada
    const id = parseInt(req.params.id);
    const fecha = req.params.fecha;
    //Consulta para retornar las fechas disponibles de la pelicula
    const sqlQuery = `SELECT DISTINCT c.idcartelera AS idcartelera, p.nombre AS nombrePelicula, p.poster, p.descripcion AS descripcionPelicula, c.fecha, s.idsala AS sala, s.nombre AS nombreSala
                        FROM cartelera c
                        INNER JOIN pelicula p ON c.idpelicula=p.idpelicula
                        INNER JOIN sala s ON c.idsala=s.idsala
                        WHERE c.activa = "Si" AND c.fecha = ?  AND p.idpelicula = ?
                        ORDER BY s.nombre`;
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,[fecha,id],(err,results)=>{
      if(err){
        console.error('Error al leer la cartelera: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  });


  /* GET lista de las butacas de la cartelera*/
  router.get('/step3/:idcartelera', authenticateToken, allowRoles('Admin', 'Cliente'), function(req, res, next) {
    //Obtener los parámetros desde la llamada
    const idcartelera = parseInt(req.params.idcartelera);
    //Consulta para retornar las butacas
    const sqlQuery = `SELECT r.idreserva as id, r.butaca as numAsiento, r.estado, p.idpelicula AS pelicula,
                        p.nombre AS nombrePelicula, p.poster, p.descripcion AS descripcionPelicula, c.idcartelera AS cartelera, c.fecha, s.idsala AS sala,
                        s.nombre AS nombreSala, s.capacidad as capacidad, s.filas as filas, s.columnas as columnas
                        FROM cartelera c
                        LEFT JOIN reserva r ON c.idcartelera=r.idcartelera
                        INNER JOIN sala s ON c.idsala=s.idsala
                        INNER JOIN pelicula p ON c.idpelicula=p.idpelicula
                        where c.idcartelera = ?
                        ORDER BY r.butaca`;
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,[idcartelera],(err,results)=>{
      if(err){
        console.error('Error al leer los datos: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  });


// Ruta para registrar una reserva
router.post('/new', authenticateToken, allowRoles('Admin', 'Cliente'), async (req, res) => {
    const { idcartelera, idcliente, butaca, estado } = req.body;
    
  
    // Validación de los parámetros: asegurarse los datos sean proporcionados
    if (!idcartelera || !idcliente || !butaca || !estado) {
      return res.status(400).json({ error: 'Debes proporcionar los datos' });
    }
  
    //Consulta parametrizada para insertar nuevo registro
    const sqlQuery = 'INSERT INTO reserva (idcartelera, idcliente, butaca, estado) VALUES (?,?,?,?)';
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,[idcartelera,idcliente,butaca,estado],(err,results)=>{
        if(err){
            console.error('Error al agregar la reserva: ', err);
            if(err.code=='ER_DUP_ENTRY'){
              return res.status(500).send({message:'Este registro ya existe', code:err.code, id:err.errno, description:err.message});
            }
            else{
              return res.status(500).send({message:'Error al agregar el registro', code:err.code, id:err.errno, description:err.message});
            }  
        }
        res.status(201).json({
            message:'Registro agregado con éxito',
            reservaId: results.insertId
        });
    });
  });


  // Ruta para editar una reserva
router.put('/edit', authenticateToken, allowRoles('Admin','Cliente'), async (req, res) => {
    const { id, idcartelera, idcliente, butaca, estado } = req.body;
    
  
    // Validación de los parámetros: asegurarse de que los datos sean proporcionados
    if (!id, !idcartelera || !idcliente || !butaca || !estado) {
      return res.status(400).json({ error: 'Debes proporcionar los datos' });
    }

    //Consulta parametrizada para editar sala
    const sqlQuery = `
      UPDATE reserva
      SET idcartelera = ?, idcliente = ?, butaca = ?, estado = ?
      WHERE idreserva = ?
    `;
  
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,[idcartelera,idcliente,butaca,estado,id],(err,results)=>{
        if(err){
            console.error('Error al actualizar el registro: ', err);
            if(err.code=='ER_DUP_ENTRY'){
              return res.status(500).send({message:'El registro ya existe', code:err.code, id:err.errno, description:err.message});
            }
            else{
              return res.status(500).send({message:'Error al actualizar el registro', code:err.code, id:err.errno, description:err.message});
            }  
        }
        if(results.affectedRows==0){
          return res.status(404).json({ error: 'Registro no encontrado' });
        }
        res.json({
            message:'Registro actualizado con éxito',
            reservaId: id
        });
    });
  });

  module.exports = router;