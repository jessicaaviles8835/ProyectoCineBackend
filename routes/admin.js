var express = require('express');
var router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authentication');
const allowRoles = require('../middleware/authorization');

/* GET Reporte de actividad*/
router.get('/report', authenticateToken, allowRoles('Admin'), function(req, res, next) {
    //Consulta para retornar las reservas de los proximos 8 dias
    const sqlQuery = `SELECT (SELECT sum(s.capacidad) FROM cartelera c join sala s on s.idsala = c.idsala
                        )  as total_butacas`;
  
    //Usar el pool para los resultados
    pool.query(sqlQuery,(err,results)=>{
      if(err){
        console.error('Error al leer las reservas: ', err);
        return res.status(500).send('Error de consulta');
      }
      res.json(results); //Enviar los resultados como JSON
    });
  });

module.exports = router;