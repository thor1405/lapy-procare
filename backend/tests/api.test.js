import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

beforeAll(async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lapy_procare';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoURI);
  }
});

afterAll(async () => {
  // Clean up any test records if necessary
  await mongoose.connection.close();
});

describe('Lapy Procare Core API Health & Public Endpoints', () => {
  it('GET /health returns 200 OK and status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('Lapy Procare Core API');
  });

  it('GET /api/v1/services returns all active services', async () => {
    const res = await request(app).get('/api/v1/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.services)).toBe(true);
    expect(res.body.data.services.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/pc-builder/components returns component catalog', async () => {
    const res = await request(app).get('/api/v1/pc-builder/components');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.components)).toBe(true);
  });

  it('GET /api/v1/bookings/slots requires date parameter', async () => {
    const res = await request(app).get('/api/v1/bookings/slots');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/bookings/slots returns available slots for future date', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const res = await request(app).get(`/api/v1/bookings/slots?date=${dateStr}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.slots)).toBe(true);
    expect(res.body.data.slots.length).toBeGreaterThan(0);
  });
});

describe('Authentication & RBAC Security Tests', () => {
  let customerToken = '';
  let adminToken = '';

  it('POST /api/v1/auth/login authenticates customer successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'customer@gmail.com', password: 'Customer@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('CUSTOMER');
    customerToken = res.body.data.accessToken;
  });

  it('POST /api/v1/auth/login authenticates admin successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@lapyprocare.com', password: 'Admin@Lapy2026!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('ADMIN');
    adminToken = res.body.data.accessToken;
  });

  it('POST /api/v1/auth/login rejects incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@lapyprocare.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Customer token is forbidden from accessing Admin Dashboard (RBAC check)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Admin token can access Admin Dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
    expect(res.body.data.metrics.totalCustomers).toBeGreaterThanOrEqual(1);
  });

  it('Unauthenticated requests to protected endpoints return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/bookings/my');
    expect(res.status).toBe(401);
  });
});
