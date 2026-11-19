/**
 * Recursive sanitizer to neutralize NoSQL injection and prototype pollution attacks.
 * Strips or cleanses keys containing '$' or '.' from request body, query, and params.
 */

const sanitizeObject = (target) => {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map((item) => sanitizeObject(item));
  }

  const clean = {};
  for (const [key, value] of Object.entries(target)) {
    // Prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    // Strip NoSQL query operators ($gt, $ne, $where, etc.) and dot notation
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (value && typeof value === 'object') {
      clean[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      // Clean null bytes
      clean[key] = value.replace(/\0/g, '');
    } else {
      clean[key] = value;
    }
  }

  return clean;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};
