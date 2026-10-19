import { Router } from 'express';
import { handleAIChat } from '../controllers/aiController.js';
import { aiAssistantLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/troubleshoot', aiAssistantLimiter, handleAIChat);

export default router;
