require('dotenv').config();
process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_EXPIRES_IN = '1d';

const request = require('supertest');
const app = require('../../app');
const { setupDB, teardownDB, clearDB } = require('./testSetup');

beforeAll(async () => { await setupDB(); });
afterEach(async () => { await clearDB(); });
afterAll(async () => { await teardownDB(); });

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201 with token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'alice@example.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'Bob', password: 'pass123' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too short', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob', email: 'bob@example.com', password: '123',
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 on duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });
    const res = await request(app).post('/api/auth/register').send({ name: 'Alice2', email: 'alice@example.com', password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });
  });

  it('returns JWT on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('alice@example.com');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 on unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });
    token = res.body.token;
  });

  it('returns user profile with valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('alice@example.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});
