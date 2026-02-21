import { RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Local disk storage service implementation
export interface StorageConfig {
  allowedTypes: string[];
  maxSize: number;
  generateThumbnails?: boolean;
  compressImages?: boolean;
}

export interface UploadedFile {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

class StorageService {
  getMulterConfig(config: StorageConfig): any {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
      }
    });

    const fileFilter = (req: any, file: any, cb: any) => {
      if (config.allowedTypes.includes(file.mimetype) || config.allowedTypes.includes('*')) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Allowed: ${config.allowedTypes.join(', ')}`), false);
      }
    };

    return multer({ 
      storage, 
      limits: { fileSize: config.maxSize },
      fileFilter 
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    applicationId: string | null,
    options: { folder?: string; generateThumbnails?: boolean }
  ): Promise<UploadedFile | null> {
    if (!file) return null;
    
    // In a real database we would store this record, but currently no generic Media model exists in Prisma.
    // For now, we return the uploaded file details.
    return {
      id: uuidv4(),
      url: `/uploads/${file.filename}`,
      fileName: file.filename,
      mimeType: file.mimetype,
      size: file.size
    };
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const filePath = path.join(UPLOADS_DIR, fileId);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to delete file:', e);
      return false;
    }
  }

  async getFile(fileId: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(UPLOADS_DIR, fileId);
      if (fs.existsSync(filePath)) {
        return await fs.promises.readFile(filePath);
      }
      return null;
    } catch (e) {
      console.error('Failed to get file:', e);
      return null;
    }
  }
}

export const storageService = new StorageService();
export default storageService;
