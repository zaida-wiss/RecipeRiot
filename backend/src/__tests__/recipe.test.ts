import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connect, clearDatabase, disconnect } from './helpers/db.js';

jest.setTimeout(30000);

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await disconnect();
});

async function getAuthToken(): Promise<string> {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: 'ReceptTestare',
      email: 'recepttestare@example.com',
      password: 'superhemligt123',
    });

  return res.body.token;
}

describe('GET /api/v1/recipes', () => {
  test('ska returnera 200, data-array och pagination', async () => {
    const res = await request(app).get('/api/v1/recipes');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });

  test('ska filtrera recept med search-query', async () => {
    const token = await getAuthToken();

    await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Pannkakor' });

    await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Tomatsoppa' });

    const res = await request(app).get('/api/v1/recipes?search=pann&page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Pannkakor');
    expect(res.body.pagination.total).toBe(1);
  });
});

describe('POST /api/v1/recipes', () => {
  test('ska neka receptskapande utan token', async () => {
    const res = await request(app)
      .post('/api/v1/recipes')
      .send({ title: 'Pannkakor' });

    expect(res.status).toBe(401);
  });

  test('ska skapa ett recept med bara obligatoriska fält', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Pannkakor' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Pannkakor');
    expect(res.body.createdBy).toBeDefined();
    expect(res.body.ingredients).toEqual([]);
    expect(res.body.steps).toEqual([]);
  });

  test('ska skapa ett recept med ingredienser och steg', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Pannkakor',
        ingredients: [
          { name: 'Mjöl', quantity: 2, unit: 'dl' },
          { name: 'Mjölk', quantity: 5, unit: 'dl' },
        ],
        steps: [
          'Blanda ingredienserna.',
          'Stek pannkakorna.',
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.ingredients).toHaveLength(2);
    expect(res.body.ingredients[0].name).toBe('Mjöl');
    expect(res.body.ingredients[0].quantity).toBe(2);
    expect(res.body.ingredients[0].unit).toBe('dl');
    expect(res.body.steps).toEqual([
      'Blanda ingredienserna.',
      'Stek pannkakorna.',
    ]);
  });

  test('ska returnera 400 om title saknas', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/recipes/:id', () => {
  test('ska returnera 404 för ett id som inte finns', async () => {
    const res = await request(app).get(
      '/api/v1/recipes/000000000000000000000000'
    );

    expect(res.status).toBe(404);
  });
});
