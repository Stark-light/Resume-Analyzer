import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { AppError } from './error.middleware';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

fs.mkdirSync(config.upload.dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.upload.dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxSizeMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      cb(new AppError(400, 'Only PDF and DOCX files are supported'));
      return;
    }
    cb(null, true);
  },
});