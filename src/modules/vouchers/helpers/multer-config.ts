import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

// Configure multer for memory storage (we'll process CSV directly from buffer)
const storage = multer.memoryStorage();

// File filter to only accept CSV files
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || fileExt === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
