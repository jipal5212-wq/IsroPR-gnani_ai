import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { DIRS } from '../config.js';

// Cover images storage
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIRS.COVERS);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `cover-${Date.now()}-${unique}${ext}`);
  }
});

export const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
    }
  }
});

// Temporary chat audio upload
const audioUploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIRS.UPLOADS);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.webm';
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `chat-in-${Date.now()}-${unique}${ext}`);
  }
});

export const uploadChatAudio = multer({
  storage: audioUploadStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm' || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type.'));
    }
  }
});
