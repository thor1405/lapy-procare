import { AuditLog } from '../models/AuditLog.js';
import { logger } from '../config/logger.js';

/**
 * Record a security or administrative action to the AuditLog collection.
 * Asynchronous and resilient — never blocks or throws in the main request flow.
 */
export const recordAudit = async ({
  action,
  entity,
  entityId,
  performedBy = null,
  performedByRole = 'SYSTEM',
  ipAddress = '',
  details = {},
}) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId: String(entityId || 'N/A'),
      performedBy: performedBy || undefined,
      performedByRole,
      ipAddress,
      details,
    });
  } catch (err) {
    logger.warn(`Failed to write audit log: ${err.message}`);
  }
};
