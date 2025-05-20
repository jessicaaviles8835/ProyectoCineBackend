const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../db');

process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await db.promise().execute('INSERT INTO cartelera values (1,1,1,"2025-05-19", "Si","2025-05-19",1)');
  
});
afterAll(async () => {
  await db.promise().execute('DELETE FROM cartelera');
  await db.promise().end();
});

describe('Validar rutas de carteleras del cine', () => {
  const token = jwt.sign({ id:7, username: 'jessica3', tipo:'Admin' }, process.env.JWT_SECRET);

  it('debe insertar una cartelera en /cartelera/new', async () => {
    const res = await request(app).post('/cartelera/new').send({
      sala: 10,
      pelicula:11,
      fechaI:'2025-02-01',
      fechaF:'2025-02-10'
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM cartelera WHERE idcartelera = ? order by fecha', [res.body.carteleraId]);
    expect(rows[0].fecha.toISOString().substring(0,10)).toBe('2025-02-01');
  });

  it('debe editar una cartelera en /cartelera/edit', async () => {
    const res = await request(app).put('/cartelera/edit').send({
      id:1,
      idSala: 10,
      idPelicula:11,
      fecha:'2025-05-01',
      activa:'Si'
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM cartelera WHERE idcartelera = ? order by fecha', [res.body.carteleraId]);
    expect(rows[0].fecha.toISOString().substring(0,10)).toBe('2025-05-01');
  });

  it('debe obtener un json de carteleras', async () => {
    const res = await request(app).get('/cartelera').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((cartelera) => {
      expect(cartelera).toHaveProperty('id');
      expect(cartelera).toHaveProperty('pelicula');
      expect(cartelera).toHaveProperty('fechaFuncion');
      expect(cartelera).toHaveProperty('sala');
      expect(typeof cartelera.id).toBe('number');
      expect(typeof cartelera.pelicula).toBe('string');
      expect(typeof cartelera.fechaFuncion).toBe('string');
      expect(typeof cartelera.sala).toBe('string');
    });
  });

  it('debe obtener un json de carteleras', async () => {
    const res = await request(app).get('/').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)|| res.body == null || Object.keys(res.body).length === 0).toBe(true);
    if (Array.isArray(res.body)){
      res.body.forEach((cartelera) => {
        expect(cartelera).toHaveProperty('idpelicula');
        expect(cartelera).toHaveProperty('nombrePelicula');
        expect(cartelera).toHaveProperty('poster');
        expect(cartelera).toHaveProperty('descripcionPelicula');
        expect(typeof cartelera.id).toBe('number');
        expect(typeof cartelera.nombrePelicula).toBe('string');
        expect(typeof cartelera.poster).toBe('string');
        expect(typeof cartelera.descripcionPelicula).toBe('string');
      });
    }
  });

  
});
