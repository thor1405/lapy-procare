import { Router } from 'express';
import {
  getMyInvoices,
  getInvoiceById,
  downloadInvoicePdf,
} from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/my', getMyInvoices);
router.get('/:id', getInvoiceById);
router.get('/:id/pdf', downloadInvoicePdf);

export default router;
