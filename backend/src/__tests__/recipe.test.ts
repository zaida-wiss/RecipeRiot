const request = require('supertest');
const app = require('../app').default;
const db = require('./helpers/db');

jest.setTimeout(30000);

beforeAll(async () => {
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

  test('ska skapa ett recept med ingredienser och steg', async () => {
    const res = await request(app)
      .post('/api/v1/recipes')
      .send({
        title: 'Pannkakor',
        createdBy: 'Anna',
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
    const res = await request(app)
      .post('/api/v1/recipes')
      .send({ createdBy: 'Anna' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/recipes/:id', () => {
  test('ska returnera 404 för ett id som inte finns', async () => {
    const res = await request(app).get('/api/v1/recipes/000000000000000000000000');
    expect(res.status).toBe(404);
  });
});