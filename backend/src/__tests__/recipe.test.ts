const request = require('supertest');
const app = require('../app').default;
const db = require('./helpers/db');

beforeAll(async() => {
    await db.connect();
});

afterEach(async() => {
    await db.clearDatabase();
});

afterAll(async() => {
    await db.disconnect();
});

describe('GET /api/v1/recipes', () => {
  test('ska returnera 200 och en array', async () => {
    const res = await request(app).get('/api/v1/recipes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/v1/recipes', () => {
  test('ska skapa ett recept och returnera 201', async () => {
    const res = await request(app)
      .post('/api/v1/recipes')
      .send({ title: 'Pannkakor', createdBy: 'Anna' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Pannkakor');
  });

  test('ska returnera 500 om title saknas', async () => {
    const res = await request(app)
      .post('/api/v1/recipes')
      .send({ createdBy: 'Anna' });
    expect(res.status).toBe(500);
  });
});

describe('GET /api/v1/recipes/:id', () => {
  test('ska returnera 404 för ett id som inte finns', async () => {
    const res = await request(app).get('/api/v1/recipes/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});