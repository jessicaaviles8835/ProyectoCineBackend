const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../db');

process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await db.promise().execute('INSERT INTO reserva values (1,1,1,1,"Reservada","2025-05-19")');
  
});
afterAll(async () => {
  await db.promise().execute('DELETE FROM reserva');
  await db.promise().end();
});

describe('Validar rutas de reservas de asientos', () => {
  const token = jwt.sign({ id:7, username: 'jessica3', tipo:'Admin' }, process.env.JWT_SECRET);

  it('debe insertar una reserva en /reservas/new', async () => {
    const res = await request(app).post('/reservas/new').send({
      idcartelera: 10,
      idcliente:11,
      butaca:33,
      estado:'Reservada'
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM reserva WHERE idreserva = ?', [res.body.reservaId]);
    expect(rows[0].estado).toBe('Reservada');
  });

  it('debe editar una reserva en /reservas/edit', async () => {
    const res = await request(app).put('/reservas/edit').send({
        asiento:{cartelera:1,
                    cliente: 10,
                    numAsiento:11,
                    estado:'Pendiente',
                    activa:'Si',
                    id:1}
      
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM reserva WHERE idreserva = ?', [res.body.reservaId]);
    expect(rows[0].estado).toBe('Pendiente');
  });


  it('debe procesar una reserva en /reservas/procesar', async () => {
    const res = await request(app).put('/reservas/procesar').send({
        asientosSeleccionados:[1]
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM reserva WHERE idreserva = 1');
    expect(rows[0].estado).toBe('Reservada');
  });

  it('debe cancelar una reserva en /reservas/cancelar', async () => {
    const res = await request(app).put('/reservas/cancelar').send({
        asientosSeleccionados:[1]
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM reserva WHERE idreserva = 1');
    expect(rows.length===0).toBe(true);
  });

  
});
