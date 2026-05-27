import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { Recipe } from '../models/Recipe.js';
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

async function registerTestUser(): Promise<string> {
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: 'PrivacyUser',
      email: 'privacy@example.com',
      password: 'superhemligt123',
    });

  return res.body.token;
}

describe('GET /api/v1/privacy/export', () => {
  test('ska neka export utan token', async () => {
    const res = await request(app).get('/api/v1/privacy/export');

    expect(res.status).toBe(401);
  });

  test('ska exportera inloggad användares data', async () => {
    const token = await registerTestUser();

    const createRecipeRes = await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Mitt privata recept' });

    const res = await request(app)
      .get('/api/v1/privacy/export')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('privacy@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.recipes).toHaveLength(1);
    expect(res.body.recipes[0]._id).toBe(createRecipeRes.body._id);
  });
});

describe('DELETE /api/v1/privacy/me', () => {
  test('ska neka radering utan token', async () => {
    const res = await request(app).delete('/api/v1/privacy/me');

    expect(res.status).toBe(401);
  });

  test('ska radera användaren och anonymisera recepten', async () => {
    const token = await registerTestUser();

    await request(app)
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Recept som anonymiseras' });

    const deleteRes = await request(app)
      .delete('/api/v1/privacy/me')
      .set('Authorization', `Bearer ${token}`);

    const user = await User.findOne({ email: 'privacy@example.com' });
    const recipe = await Recipe.findOne({ title: 'Recept som anonymiseras' });

    expect(deleteRes.status).toBe(204);
    expect(user).toBeNull();
    expect(recipe?.createdBy).toBe('Raderad användare');
  });
});