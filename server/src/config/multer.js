import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || 'uploads';

// Ensure upload directories exist
const dirs = ['products', 'avatars'].map(d => path.join(uploadDir, d));
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || 'products';
    cb(null, path.join(uploadDir, type));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, WebP) yang diperbolehkan'), false);
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

export const uploadProduct = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize, files: 5 },
});

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize, files: 1 },
});

export default multer({ storage, fileFilter, limits: { fileSize: maxFileSize } });
