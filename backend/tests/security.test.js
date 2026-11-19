import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { sanitizeInput } from '../src/middleware/sanitize.js';

describe('Advanced Security Hardening Tests', () => {
  it('Sanitizer strips NoSQL injection operator keys ($gt, $ne, $where)', () => {
    const maliciousReq = {
      body: {
        email: 'test@example.com',
        $gt: '',
        nested: {
          $ne: null,
          validKey: 'safe-value',
        },
      },
      query: {
        status: {
          $regex: '.*',
        },
        page: '1',
      },
      params: {
        'id.with.dot': 'val',
      },
    };

    const next = () => {};
    sanitizeInput(maliciousReq, {}, next);

    // Verify $gt was stripped from body
    expect(maliciousReq.body.$gt).toBeUndefined();
    expect(maliciousReq.body.email).toBe('test@example.com');

    // Verify $ne was stripped from nested object
    expect(maliciousReq.body.nested.$ne).toBeUndefined();
    expect(maliciousReq.body.nested.validKey).toBe('safe-value');

    // Verify $regex was stripped from query
    expect(maliciousReq.query.status).toEqual({});
    expect(maliciousReq.query.page).toBe('1');

    // Verify dot key was stripped
    expect(maliciousReq.params['id.with.dot']).toBeUndefined();
  });

  it('HTTP Response contains hardened security headers', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);

    // Verify Helmet security headers
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['content-security-policy']).toBeDefined();
    // Verify X-Powered-By is removed
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('Zod validation blocks malformed login and registration payloads', async () => {
    // Malformed email
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
  });

  it('Contact route enforces Zod schema validation and rejects invalid fields', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        name: 'A', // too short (<2 chars)
        email: 'invalid-email',
        phone: '123', // too short (<8 chars)
        message: 'hi', // too short (<5 chars)
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
  });
});
