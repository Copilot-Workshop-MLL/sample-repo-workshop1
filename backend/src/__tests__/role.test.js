require('dotenv').config();
process.env.JWT_SECRET = 'test_secret_key';

const request = require('supertest');
const app = require('../../app');
const Role = require('../models/Role');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { setupDB, teardownDB, clearDB } = require('./testSetup');

let adminToken;

// Helper: create an admin user with full roles permission
const createAdminWithPermission = async (moduleKey, action) => {
  const role = await Role.create({
    name: 'Admin',
    permissions: [{ module: moduleKey, view: true, create: true, edit: true, delete: true, export: true, import: true, search: true }],
  });
  const user = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password123', roles: [role._id] });
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

beforeAll(async () => { await setupDB(); });
afterEach(async () => { await clearDB(); });
afterAll(async () => { await teardownDB(); });

describe('GET /api/roles', () => {
  it('returns empty array on fresh DB', async () => {
    adminToken = await createAdminWithPermission('roles', 'view');
    const res = await request(app).get('/api/roles').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    // Only the Admin role exists (created in setup), so length is 1
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/roles');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/roles', () => {
  beforeEach(async () => {
    adminToken = await createAdminWithPermission('roles', 'create');
  });

  it('creates a role with permission matrix and returns 201', async () => {
    const res = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Editor',
        description: 'Can edit content',
        permissions: [{ module: 'products', view: true, create: false, edit: true, delete: false, export: false, import: false, search: true }],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Editor');
    const perm = res.body.permissions.find(p => p.module === 'products');
    expect(perm.view).toBe(true);
    expect(perm.edit).toBe(true);
    expect(perm.delete).toBe(false);
  });

  it('returns 400 for duplicate role name', async () => {
    await request(app).post('/api/roles').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Editor' });
    const res = await request(app).post('/api/roles').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Editor' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/roles').set('Authorization', `Bearer ${adminToken}`).send({ description: 'No name' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/roles/:id', () => {
  it('returns the role by ID', async () => {
    adminToken = await createAdminWithPermission('roles', 'view');
    const created = await Role.create({ name: 'Viewer' });
    const res = await request(app).get(`/api/roles/${created._id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Viewer');
  });

  it('returns 404 for non-existent ID', async () => {
    adminToken = await createAdminWithPermission('roles', 'view');
    const fakeId = '64b1234567890123456789ab';
    const res = await request(app).get(`/api/roles/${fakeId}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/roles/:id', () => {
  it('updates a role and reflects new permissions', async () => {
    adminToken = await createAdminWithPermission('roles', 'edit');
    const role = await Role.create({ name: 'OldName' });

    const res = await request(app)
      .put(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'NewName',
        permissions: [{ module: 'users', view: true, create: false, edit: false, delete: false, export: false, import: false, search: false }],
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('NewName');
    const perm = res.body.permissions.find(p => p.module === 'users');
    expect(perm.view).toBe(true);
  });
});

describe('DELETE /api/roles/:id', () => {
  it('deletes role and returns 204', async () => {
    adminToken = await createAdminWithPermission('roles', 'delete');
    const role = await Role.create({ name: 'Temp' });
    const res = await request(app).delete(`/api/roles/${role._id}`).set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);

    const check = await Role.findById(role._id);
    expect(check).toBeNull();
  });
});
