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

type TestUser = {
  email: string;
  token: string;
  userId: string;
};

async function registerAndLoginUser(
  username: string,
  email: string
): Promise<TestUser> {
  const registerRes = await request(app)
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

  return {
    email,
    token: loginRes.body.token,
    userId: registerRes.body.user.id,
  };
}

async function createRecipe(token: string, title: string) {
  return request(app)
    .post('/api/v1/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title,
      ingredients: [
        { name: 'Mjöl', quantity: 2, unit: 'dl' },
      ],
      steps: ['Blanda ingredienserna.'],
    });
}

describe('GET /api/v1/gdpr/export', () => {
  test('ska neka export utan token', async () => {
    const res = await request(app).get('/api/v1/gdpr/export');

    expect(res.status).toBe(401);
  });

  test('ska exportera användarens konto och egna recept', async () => {
    const owner = await registerAndLoginUser(
      'GdprOwner',
      'gdpr-owner@example.com'
    );
    const otherUser = await registerAndLoginUser(
      'OtherOwner',
      'other-owner@example.com'
    );

    await createRecipe(owner.token, 'Mitt GDPR-recept');
    await createRecipe(otherUser.token, 'Någon annans recept');

    const res = await request(app)
      .get('/api/v1/gdpr/export')
      .set('Authorization', `Bearer ${owner.token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.headers['content-disposition']).toContain(
      'reciperiot-my-DataView.json'
    );
    expect(res.body.user.id).toBe(owner.userId);
    expect(res.body.user.email).toBe(owner.email);
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.recipes).toHaveLength(1);
    expect(res.body.recipes[0].title).toBe('Mitt GDPR-recept');
  });
});

describe('DELETE /api/v1/gdpr/me', () => {
  test('ska soft delete-markera den inloggade användaren', async () => {
    const user = await registerAndLoginUser(
      'SoftDeleteUser',
      'soft-delete@example.com'
    );

    const res = await request(app)
      .delete('/api/v1/gdpr/me')
      .set('Authorization', `Bearer ${user.token}`);

    const deletedUser = await User.findById(user.userId);

    expect(res.status).toBe(204);
    expect(deletedUser?.isDeleted).toBe(true);
    expect(deletedUser?.deletedAt).toBeInstanceOf(Date);
  });
});

describe('DELETE /api/v1/gdpr/me/hard', () => {
  test('ska radera användaren och användarens recept permanent', async () => {
    const user = await registerAndLoginUser(
      'HardDeleteUser',
      'hard-delete@example.com'
    );

    await createRecipe(user.token, 'Recept som ska raderas');

    const res = await request(app)
      .delete('/api/v1/gdpr/me/hard')
      .set('Authorization', `Bearer ${user.token}`);

    const deletedUser = await User.findById(user.userId);
    const remainingRecipes = await Recipe.countDocuments({
      createdBy: user.userId,
    });

    expect(res.status).toBe(204);
    expect(deletedUser).toBeNull();
    expect(remainingRecipes).toBe(0);
  });
});
