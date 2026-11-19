import { Router } from 'express';
import { submitInquiry } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { contactInquirySchema } from '../validators/contactValidator.js';

const router = Router();

router.post('/', contactLimiter, validate(contactInquirySchema), submitInquiry);

export default router;
