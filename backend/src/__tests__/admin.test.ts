import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';
import { connect, clearDatabase, disconnect } from './helpers/db.js';
import { User } from '../models/User.js';
import { Recipe } from '../models/Recipe.js';

jest.setTimeout(30000);

let sharedAdminToken: string;
let sharedAdminUser: any;

beforeAll(async () => {
  await connect();
  const { adminToken, adminUser } = await createAndLoginAdmin();
  sharedAdminToken = adminToken;
  sharedAdminUser = adminUser;
});

afterAll(async () => {
  await clearDatabase();
  await disconnect();
});

// ─── Hjälpfunktioner ──────────────────────────────────────────────────────────

async function createAndLoginAdmin() {
  const adminEmail = `admin${Math.random().toString(36).substr(2, 5)}@example.com`;
  const password = 'superhemligt123';

  // Registrera admin
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: 'admin' + Math.random().toString(36).substr(2, 5),
      email: adminEmail,
      password,
    });

  const adminUser = await User.findById(registerRes.body.user.id);
  if (adminUser) {
    adminUser.role = 'admin';
    await adminUser.save();
  }

  // Logga in EFTER att role är ändrad så JWT får rätt role
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      identifier: adminEmail,
      password,
    });

  return { adminUser, adminToken: loginRes.body.token };
}

async function createAndLoginRegularUser() {
  const email = `regular${Math.random().toString(36).substr(2, 5)}@example.com`;
  const password = 'superhemligt123';

  // Registrera user
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send({
      username: 'regular' + Math.random().toString(36).substr(2, 5),
      email,
      password,
    });

  const user = await User.findById(registerRes.body.user.id);

  // Logga in
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({
      identifier: email,
      password,
    });

  return { user, token: loginRes.body.token };
}

async function createRecipeForUser(userId: string | any, title = 'Test Recept') {
  const recipe = await Recipe.create({
    title,
    createdBy: userId.toString(),
    ingredients: [
      { name: 'Mjöl', quantity: 2, unit: 'dl' },
    ],
    steps: [
      'Blanda ingredienserna',
      'Häll i form',
      'Baka i ugn',
    ],
  });

  return recipe;
}

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('Admin API - Soft Delete User', () => {
  describe('PATCH /api/v1/admin/users/:id/soft-delete', () => {
    it('ska radera en användare om man är admin', async () => {
      const { user: targetUser } = await createAndLoginRegularUser();

      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUser!._id}/soft-delete`)
        .set('Authorization', `Bearer ${sharedAdminToken}`);

      expect(res.status).toBe(204);

      const deletedUser = await User.findById(targetUser!._id);
      expect(deletedUser?.isDeleted).toBe(true);
      expect(deletedUser?.deletedAt).toBeDefined();
    });

    it('ska returnera 401 om man inte är inloggad', async () => {
      const { user: targetUser } = await createAndLoginRegularUser();

      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUser!._id}/soft-delete`);

      expect(res.status).toBe(401);
    });

    it('ska returnera 403 om man inte är admin', async () => {
      const { token: regularToken } = await createAndLoginRegularUser();
      const { user: targetUser } = await createAndLoginRegularUser();

      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUser!._id}/soft-delete`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(res.status).toBe(403);
    });

    it('ska returnera 404 om användaren inte existerar', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/507f1f77bcf86cd799439011/soft-delete`)
        .set('Authorization', `Bearer ${sharedAdminToken}`);

      expect(res.status).toBe(404);
    });

    it('ska radera användarens recept när användaren raderas', async () => {
      const { user: targetUser } = await createAndLoginRegularUser();

      const recipe = await createRecipeForUser(targetUser!._id.toString(), 'Pannkakor');
      expect(recipe.deletedAt).toBeNull();

      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUser!._id}/soft-delete`)
        .set('Authorization', `Bearer ${sharedAdminToken}`);

      expect(res.status).toBe(204);

      const deletedRecipe = await Recipe.findById(recipe._id);
      expect(deletedRecipe?.deletedAt).toBeDefined();
    });

    it('ska returnera 403 om den sista adminen försöker radera sig själv', async () => {
      // sharedAdminUser är den enda adminen i systemet
      const res = await request(app)
        .patch(`/api/v1/admin/users/${sharedAdminUser._id.toString()}/soft-delete`)
        .set('Authorization', `Bearer ${sharedAdminToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Den sista adminen kan inte raderas');
    });
  });
});

describe('Admin API - Soft Delete Recipe', () => {
  describe('PATCH /api/v1/admin/recipes/:id/soft-delete', () => {
    let testRecipe: any;

    beforeEach(async () => {
      const { user } = await createAndLoginRegularUser();
      testRecipe = await createRecipeForUser(user!._id.toString(), 'Pasta');
    });

    it('ska radera ett recept om man är admin', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/recipes/${testRecipe._id}/soft-delete`)
        .set('Authorization', `Bearer ${sharedAdminToken}`);

      expect(res.status).toBe(204);

      const deletedRecipe = await Recipe.findById(testRecipe._id);
      expect(deletedRecipe?.deletedAt).toBeDefined();
    });

    it('ska returnera 401 om man inte är inloggad', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/recipes/${testRecipe._id}/soft-delete`);

      expect(res.status).toBe(401);
    });

    it('ska returnera 404 om receptet inte existerar', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/recipes/507f1f77bcf86cd799439011/soft-delete`)
        .set('Authorization', `Bearer ${sharedAdminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
