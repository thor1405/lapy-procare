import { Router } from 'express';
import {
  getComponents,
  validateAndCalculateBuild,
  saveBuild,
  getMyBuilds,
  requestBuildQuote,
} from '../controllers/pcBuilderController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public
router.get('/components', getComponents);
router.post('/calculate', validateAndCalculateBuild);

// Authenticated
router.post('/save', authenticate, saveBuild);
router.get('/my-builds', authenticate, getMyBuilds);
router.post('/:id/request-quote', authenticate, requestBuildQuote);

export default router;
