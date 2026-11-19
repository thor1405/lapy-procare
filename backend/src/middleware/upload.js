import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Strict whitelist of permitted image extensions and corresponding MIME types
const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Determine safe extension directly from verified MIME type, ignoring client-supplied dangerous extensions
    const safeExt = MIME_TO_EXT[file.mimetype] || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `device-${uniqueSuffix}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = Object.keys(MIME_TO_EXT);
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

  // Check both MIME type and file extension
  if (!allowedMimes.includes(file.mimetype) || !allowedExts.includes(ext)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }

  // Prevent double extension attacks (e.g. evil.php.jpg, payload.svg.png)
  const baseNameWithoutExt = path.basename(file.originalname, ext);
  if (baseNameWithoutExt.includes('.')) {
    return cb(new Error('Invalid file name. Double extensions are strictly prohibited.'), false);
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // max 5 photos per upload
  },
  fileFilter,
});
