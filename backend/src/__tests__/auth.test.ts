process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '10';

import request from 'supertest';
import app from '../app';
import { connect, clearDatabase, disconnect } from './helpers/db';

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

describe('POST /api/v1/auth/register', () => {
  test('ska registrera användare och inte returnera passwordHash', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'Annapanna',
        email: 'annapanna@example.com',
        password: 'superhemligt123',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('annapanna@example.com');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('ska returnera 409 om email redan finns', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'Annapanna',
        email: 'annapanna@example.com',
        password: 'superhemligt123',
      });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'Annapanna2',
        email: 'annapanna@example.com',
        password: 'superhemligt123',
      });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  test('ska logga in med rätt lösenord', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'Annapanna',
        email: 'annapanna@example.com',
        password: 'superhemligt123',
      });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'annapanna@example.com',
        password: 'superhemligt123',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('ska returnera 401 med fel lösenord', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'Annapanna',
        email: 'annapanna@example.com',
        password: 'superhemligt123',
      });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'annapanna@example.com',
        password: 'fel-losenord',
      });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  test('ska neka anrop utan token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
  });

  test('ska tillåta anrop med giltig token', async () => {
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'Annapanna',
        email: 'annapanna@example.com',
        password: 'superhemligt123',
      });

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${registerRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('annapanna@example.com');
  });
});