import { Router } from 'express';
import {
  getAssignedRepairs,
  updateDiagnosticFindings,
  updateTechnicianStatus,
  submitCompletionReport,
} from '../controllers/technicianController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate, authorize(ROLES.TECHNICIAN, ROLES.ADMIN));

router.get('/repairs', getAssignedRepairs);
router.patch('/repairs/:ticketId/findings', updateDiagnosticFindings);
router.patch('/repairs/:ticketId/status', updateTechnicianStatus);
router.post('/repairs/:ticketId/complete', submitCompletionReport);

export default router;
