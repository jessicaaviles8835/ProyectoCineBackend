const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const db = require('../db');
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  await db.promise().execute('INSERT INTO usuario values (1,"usuarioprueba", "up@up.com","$2b$10$YxaMKkbGWWC1l0w.J/5gKOrH33cF2aKW5kmP42MuBUTGrnSBE07zS","Cliente", "Si", "2025-05-19")');
  
});

afterAll(async () => {
  await db.promise().execute('DELETE FROM usuario');
  await db.promise().end();
});

describe('Validar autenticación y autorización', () => {
  const token = jwt.sign({ id:6, username: 'jessica2', tipo:'Cliente' }, process.env.JWT_SECRET);
  it('debe bloquear sin token', async () => {
    const res = await request(app).get('/users/profile/view');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Acceso denegado, debe ingresar');
  });

  it('debe permitir con token válido', async () => {
    const res = await request(app)
      .get('/users/profile/view')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Bienvenido jessica2');
  });

  it('debe rechazar token inválido', async () => {
    const res = await request(app)
      .get('/users/profile/view')
      .set('Authorization', 'Bearer token-falso');

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Acceso denegado, no tiene permisos');
  });

  it('debe rechazar no admin', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.mensaje).toBe('Acceso denegado');
  });

});

describe('Validar puntos de usuarios', () => {
  const token = jwt.sign({ id:7, username: 'jessica3', tipo:'Admin' }, process.env.JWT_SECRET);
  it('debe obtener un json de usuarios', async () => {
    const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((usuario) => {
      expect(usuario).toHaveProperty('id');
      expect(usuario).toHaveProperty('nombre');
      expect(usuario).toHaveProperty('tipo');
      expect(usuario).toHaveProperty('activo');
      expect(typeof usuario.id).toBe('number');
      expect(typeof usuario.nombre).toBe('string');
      expect(typeof usuario.tipo).toBe('string');
      expect(typeof usuario.activo).toBe('string');
    });
  });
  it('debe obtener un usuario', async () => {
    const res = await request(app).get('/users/1').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('idusuario');
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('tipo');
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('activo');
  });
  
  it('debe insertar un usuario cliente en /users/register', async () => {
    const res = await request(app).post('/users/register').send({
      username: 'usuariopost',
      email: 'testpost@testpost.com',
      password: 'passprueba',
    });

    expect(res.statusCode).toBe(201);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM usuario WHERE idusuario = ?', [res.body.usuarioId]);
    expect(rows[0].nombre).toBe('usuariopost');
  });

  it('debe insertar un usuario en /users/new', async () => {
    const res = await request(app).post('/users/new').send({
      username: 'usuarionew',
      email: 'testnew@testnew.com',
      password: 'passprueba',
      tipo:"Admin",
      activo:"Si"
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(201);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM usuario WHERE idusuario = ?', [res.body.usuarioId]);
    expect(rows[0].nombre).toBe('usuarionew');
  });

  it('debe editar un usuario en /users/edit', async () => {
    const res = await request(app).put('/users/edit').send({
      id:1,
      username: 'usuarioeditado',
      email: 'up@up.com',
      password: 'passprueba',
      tipo:"Admin",
      activo:"Si"
    }).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    console.log(res.body)
    const [rows] = await db.promise().execute('SELECT * FROM usuario WHERE idusuario = ?', [res.body.usuarioId]);
    expect(rows[0].nombre).toBe('usuarioeditado');
  });

});
