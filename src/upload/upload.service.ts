import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadPath = process.env.UPLOAD_PATH || './uploads';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor() {
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (file.size > this.maxFileSize) {
      return { valid: false, error: `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit` };
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: PDF, JPEG, PNG, DOC, DOCX`,
      };
    }

    return { valid: true };
  }

  generateFileName(originalName: string, prefix?: string): string {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(originalName);
    const name = originalName.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = prefix
      ? `${prefix}_${name}_${uniqueSuffix}${ext}`
      : `${name}_${uniqueSuffix}${ext}`;
    return fileName;
  }

  getFileUrl(fileName: string): string {
    return `/uploads/${fileName}`;
  }
}
