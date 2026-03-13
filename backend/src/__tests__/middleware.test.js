require('dotenv').config();
process.env.JWT_SECRET = 'test_secret_key';

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');
const User = require('../models/User');
const Role = require('../models/Role');
const { setupDB, teardownDB, clearDB } = require('./testSetup');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(async () => { await setupDB(); });
afterEach(async () => { await clearDB(); });
afterAll(async () => { await teardownDB(); });

describe('authMiddleware', () => {
  let user;

  beforeEach(async () => {
    user = await User.create({ name: 'Test', email: 'test@example.com', password: 'password123' });
  });

  it('populates req.user with valid token', async () => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('test@example.com');
  });

  it('returns 401 when no token provided', async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for expired token', async () => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for tampered token', async () => {
    const req = { headers: { authorization: 'Bearer tampered.token.value' } };
    const res = mockRes();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('checkPermission middleware', () => {
  it('calls next() when user has the required permission', () => {
    const req = {
      user: {
        roles: [{
          permissions: [{ module: 'users', view: true, create: false, edit: false, delete: true, export: false, import: false, search: false }],
        }],
      },
    };
    const res = mockRes();
    const next = jest.fn();

    checkPermission('users', 'delete')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 403 when user lacks the permission', () => {
    const req = {
      user: {
        roles: [{
          permissions: [{ module: 'users', view: true, create: false, edit: false, delete: false, export: false, import: false, search: false }],
        }],
      },
    };
    const res = mockRes();
    const next = jest.fn();

    checkPermission('users', 'delete')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when module is not in the role permissions', () => {
    const req = {
      user: {
        roles: [{
          permissions: [{ module: 'products', view: true, create: false, edit: false, delete: false, export: false, import: false, search: false }],
        }],
      },
    };
    const res = mockRes();
    const next = jest.fn();

    checkPermission('reports', 'view')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 403 when user has no roles', () => {
    const req = { user: { roles: [] } };
    const res = mockRes();
    const next = jest.fn();

    checkPermission('users', 'view')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('grants access via union of multiple roles', () => {
    const req = {
      user: {
        roles: [
          { permissions: [{ module: 'users', view: false, create: false, edit: false, delete: false, export: false, import: false, search: false }] },
          { permissions: [{ module: 'users', view: false, create: false, edit: false, delete: true,  export: false, import: false, search: false }] },
        ],
      },
    };
    const res = mockRes();
    const next = jest.fn();

    checkPermission('users', 'delete')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
