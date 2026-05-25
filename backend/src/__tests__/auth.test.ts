process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/reciperiot-test';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.JWT_SECRET = 'test-secret-minst-20-tecken';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_SALT_ROUNDS = '10';

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

type RegisterOverrides = Partial<{
  username: string;
  email: string;
  password: string;
}>;

type LoginOverrides = Partial<{
  identifier: string;
  password: string;
}>;

async function registerTestUser(overrides: RegisterOverrides = {}) {
  const user = {
    username: 'Annapanna',
    email: 'annapanna@example.com',
    password: 'superhemligt123',
    ...overrides,
  };

  return request(app)
    .post('/api/v1/auth/register')
    .send(user);
}

async function loginTestUser(overrides: LoginOverrides = {}) {
  const credentials = {
    identifier: 'annapanna@example.com',
    password: 'superhemligt123',
    ...overrides,
  };

  return request(app)
    .post('/api/v1/auth/login')
    .send(credentials);
}

describe('POST /api/v1/auth/register', () => {
  test('ska registrera användare och inte returnera passwordHash', async () => {
    const res = await registerTestUser();

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('annapanna@example.com');
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('ska returnera 409 om email redan finns', async () => {
    await registerTestUser();

    const res = await registerTestUser({
      username: 'Annapanna2',
    });

    expect(res.status).toBe(409);
  });

  test('ska returnera 409 om användarnamn redan finns', async () => {
    await registerTestUser();

    const res = await registerTestUser({
      email: 'annan@example.com',
    });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/v1/auth/login', () => {
  test('ska logga in med rätt lösenord', async () => {
    await registerTestUser();

    const res = await loginTestUser();

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('ska logga in med användarnamn och rätt lösenord', async () => {
    await registerTestUser();

    const res = await loginTestUser({
      identifier: 'Annapanna',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('ska returnera 401 med fel lösenord', async () => {
    await registerTestUser();

    const res = await loginTestUser({
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
    const registerRes = await registerTestUser();

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${registerRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('annapanna@example.com');
  });
});
