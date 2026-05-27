import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';
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

async function registerAndLoginUser(
  username: string,
  email: string
): Promise<string> {
  await request(app)
    .post('/api/v1/auth/register')
    .send({
      username,
      email,
      password: 'superhemligt123',
    });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      identifier: email,
      password: 'superhemligt123',
    });

  return loginRes.body.token;
}

async function registerAndLoginAdmin(): Promise<string> {
  await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: 'AdminUser',
      email: 'admin@example.com',
      password: 'superhemligt123',
    });

  await User.findOneAndUpdate(
    { email: 'admin@example.com' },
    { role: 'admin' }
  );

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      identifier: 'admin@example.com',
      password: 'superhemligt123',
    });

  return loginRes.body.token;
}

async function getRegisteredUserId(
  username: string,
  email: string
): Promise<string> {
  await registerAndLoginUser(username, email);

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Testanvändaren kunde inte hittas');
  }

  return user._id.toString();
}

async function getTargetUserAndRegularToken(): Promise<{
  token: string;
  userId: string;
}> {
  const userId = await getRegisteredUserId(
    'TargetUser',
    'target@example.com'
  );

  const token = await registerAndLoginUser(
    'RegularUser',
    'regular@example.com'
  );

  return { token, userId };
}

describe('GET /api/v1/users', () => {
  test('ska neka anrop utan token', async () => {
    const res = await request(app).get('/api/v1/users');

    expect(res.status).toBe(401);
  });

  test('ska neka vanlig user från att lista användare', async () => {
    const token = await registerAndLoginUser(
      'RegularUser',
      'regular@example.com'
    );

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  test('ska låta admin lista användare', async () => {
    const token = await registerAndLoginAdmin();

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/v1/users', () => {
  test('ska neka användarskapande utan token', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        username: 'NewUser',
        email: 'new@example.com',
      });

    expect(res.status).toBe(401);
  });
});

describe('skyddade /api/v1/users/:id-routes', () => {
  test.each([
    {
      method: 'get',
      name: 'hämta användare via id',
    },
    {
      body: { username: 'UpdatedUser' },
      method: 'put',
      name: 'uppdatera användare',
    },
    {
      method: 'delete',
      name: 'radera användare',
    },
  ] as const)('ska neka vanlig user från att $name', async ({ body, method }) => {
    const { token, userId } = await getTargetUserAndRegularToken();
    const route = `/api/v1/users/${userId}`;
    const agent = request(app)[method](route).set(
      'Authorization',
      `Bearer ${token}`
    );

    if (body) {
      agent.send(body);
    }

    const res = await agent;

    expect(res.status).toBe(403);
  });
});
