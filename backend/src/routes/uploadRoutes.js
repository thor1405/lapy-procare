import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const router = Router();

router.post('/photos', authenticate, upload.array('photos', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return errorResponse(res, 'No files were uploaded', 400);
  }

  const urls = req.files.map((file) => `/uploads/${file.filename}`);
  return successResponse(res, 'Photos uploaded successfully', { urls });
});

export default router;
