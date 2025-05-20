const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../db');

process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await db.promise().execute('INSERT INTO pelicula values (1,"El Zorro", "1745083197972-intensamente.jpeg","Película de la vida del zorro", "2025-05-19",1, "Si")');
  
});
afterAll(async () => {
  await db.promise().execute('DELETE FROM pelicula');
  await db.promise().end();
});

describe('Validar rutas de peliculas', () => {
  const token = jwt.sign({ id:7, username: 'jessica3', tipo:'Admin' }, process.env.JWT_SECRET);

  it('debe insertar una película en /peliculas/new', async () => {
    const res = await request(app).post('/peliculas/new')
    .field('nombre', 'El Conejo')
    .field('descripcion', 'El Conejo es una película de 1988 que muestra a un conejo')
    .attach('file', 'posters/1745083197972-intensamente.jpeg')
    .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM pelicula WHERE idpelicula = ?', [res.body.peliculaId]);
    expect(rows[0].nombre).toBe('El Conejo');
  });

  it('debe editar una película en /peliculas/edit', async () => {
    const res = await request(app).put('/peliculas/edit')
    .field('idpelicula', 1)
    .field('nombre', 'El Zorro editado')
    .field('descripcion', 'Cambié la descripción')
    .field('activa', 'Si')
    .field('poster', '1745083197972-intensamente.jpeg')
    .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM pelicula WHERE idpelicula = ?', [res.body.peliculaId]);
    expect(rows[0].nombre).toBe('El Zorro editado');
  });

  it('debe obtener un json de peliculas', async () => {
    const res = await request(app).get('/peliculas').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((pelicula) => {
      expect(pelicula).toHaveProperty('idpelicula');
      expect(pelicula).toHaveProperty('nombre');
      expect(pelicula).toHaveProperty('poster');
      expect(pelicula).toHaveProperty('descripcion');
      expect(typeof pelicula.idpelicula).toBe('number');
      expect(typeof pelicula.nombre).toBe('string');
      expect(typeof pelicula.poster).toBe('string');
      expect(typeof pelicula.descripcion).toBe('string');
    });
  });

  it('debe obtener una película', async () => {
    const res = await request(app).get('/peliculas/1').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('idpelicula');
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('poster');
    expect(res.body).toHaveProperty('descripcion');
    expect(res.body).toHaveProperty('activa');
  });


});
