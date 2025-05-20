const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../db');


process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await db.promise().execute('INSERT INTO sala values (1,"Sala Pruebas",10,10,100,"2025-05-19",1, "Si")');
  
});
afterAll(async () => {
  await db.promise().execute('DELETE FROM sala');
  await db.promise().end();
});

describe('Validar rutas de salas de cine', () => {
  const token = jwt.sign({ id:7, username: 'jessica3', tipo:'Admin' }, process.env.JWT_SECRET);

  it('debe insertar una sala en /salas/new', async () => {
    const res = await request(app).post('/salas/new').send({
      nombre: 'Sala Creada',
      filas:10,
      columnas:10
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM sala WHERE idsala = ?', [res.body.salaId]);
    expect(rows[0].nombre).toBe('Sala Creada');
  });

  it('debe editar una sala en /salas/edit', async () => {
    const res = await request(app).put('/salas/edit').send({
      id:1,
      nombre: 'Sala Editada',
      filas:10,
      columnas:10,
      activa:'Si'
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM sala WHERE idsala = ?', [res.body.salaId]);
    expect(rows[0].nombre).toBe('Sala Editada');
  });

  it('debe obtener un json de salas', async () => {
    const res = await request(app).get('/salas').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((sala) => {
      expect(sala).toHaveProperty('idsala');
      expect(sala).toHaveProperty('nombre');
      expect(sala).toHaveProperty('capacidad');
      expect(typeof sala.idsala).toBe('number');
      expect(typeof sala.nombre).toBe('string');
      expect(typeof sala.capacidad).toBe('number');
    });
  });

  it('debe obtener una sala', async () => {
    const res = await request(app).get('/salas/1').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('idsala');
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('filas');
    expect(res.body).toHaveProperty('columnas');
    expect(res.body).toHaveProperty('activa');
  });


});
