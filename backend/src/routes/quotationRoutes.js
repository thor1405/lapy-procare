import { Router } from 'express';
import {
  getMyQuotations,
  getQuotationById,
  approveQuotation,
  rejectQuotation,
  requestClarification,
  downloadQuotationPdf,
} from '../controllers/quotationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/my', getMyQuotations);
router.get('/:id', getQuotationById);
router.post('/:id/approve', approveQuotation);
router.post('/:id/reject', rejectQuotation);
router.post('/:id/clarify', requestClarification);
router.get('/:id/pdf', downloadQuotationPdf);

export default router;
