require('dotenv').config();
process.env.JWT_SECRET = 'test_secret_key';

const request = require('supertest');
const app = require('../../app');
const Role = require('../models/Role');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { setupDB, teardownDB, clearDB } = require('./testSetup');

let adminToken;

const createAdminToken = async () => {
  const role = await Role.create({
    name: 'SuperAdmin',
    permissions: [
      { module: 'users', view: true, create: true, edit: true, delete: true, export: true, import: true, search: true },
    ],
  });
  const user = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password123', roles: [role._id] });
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

beforeAll(async () => { await setupDB(); });
afterEach(async () => { await clearDB(); });
afterAll(async () => { await teardownDB(); });

describe('GET /api/users', () => {
  it('returns users list without password field', async () => {
    adminToken = await createAdminToken();
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(u => expect(u).not.toHaveProperty('password'));
  });
});

describe('POST /api/users', () => {
  beforeEach(async () => { adminToken = await createAdminToken(); });

  it('creates a user with assigned role and returns 201', async () => {
    const role = await Role.create({ name: 'Editor' });
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bob', email: 'bob@example.com', password: 'password123', roles: [role._id] });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Bob');
    expect(res.body).not.toHaveProperty('password');
    expect(res.body.roles.length).toBe(1);
    expect(res.body.roles[0].name).toBe('Editor');
  });

  it('returns 400 for missing email', async () => {
    const res = await request(app).post('/api/users').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bob', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for duplicate email', async () => {
    await request(app).post('/api/users').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bob', email: 'bob@example.com', password: 'password123' });
    const res = await request(app).post('/api/users').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bob2', email: 'bob@example.com', password: 'password123' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/users/:id', () => {
  it('updates user roles and reflects in response', async () => {
    adminToken = await createAdminToken();
    const role1 = await Role.create({ name: 'Viewer' });
    const role2 = await Role.create({ name: 'Editor' });

    const created = await User.create({ name: 'Carol', email: 'carol@example.com', password: 'password123', roles: [role1._id] });

    const res = await request(app)
      .put(`/api/users/${created._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Carol Updated', roles: [role2._id] });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Carol Updated');
    expect(res.body.roles[0].name).toBe('Editor');
  });
});

describe('DELETE /api/users/:id', () => {
  it('deletes user and returns 204', async () => {
    adminToken = await createAdminToken();
    const user = await User.create({ name: 'Dave', email: 'dave@example.com', password: 'password123' });

    const res = await request(app)
      .delete(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
    const check = await User.findById(user._id);
    expect(check).toBeNull();
  });
});
