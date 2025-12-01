import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { getSupabaseClient } from './supabaseService';

// Optional AWS SDK imports - only used if AWS credentials are configured
let S3Client: any;
let PutObjectCommand: any;
let GetObjectCommand: any;
let DeleteObjectCommand: any;
let getSignedUrl: any;

try {
  const s3Client = require('@aws-sdk/client-s3');
  S3Client = s3Client.S3Client;
  PutObjectCommand = s3Client.PutObjectCommand;
  GetObjectCommand = s3Client.GetObjectCommand;
  DeleteObjectCommand = s3Client.DeleteObjectCommand;
  const presigner = require('@aws-sdk/s3-request-presigner');
  getSignedUrl = presigner.getSignedUrl;
} catch (e) {
  // AWS SDK not installed - will use local storage only
  console.warn('⚠️ AWS SDK not installed - using local storage only');
}

interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnails?: boolean;
  compressImages?: boolean;
}

interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  familyId?: string;
}

class StorageService {
  private s3Client: any = null;
  private bucketName: string;
  private uploadPath: string;

  constructor() {
    this.initializeS3();
    this.bucketName = process.env.AWS_S3_BUCKET || 'bondarys-files';
    this.uploadPath = process.env.UPLOAD_PATH || 'uploads';
  }

  private initializeS3() {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && S3Client) {
      try {
        this.s3Client = new S3Client({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
        console.log('✅ AWS S3 client initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize AWS S3 - using local storage:', error);
      }
    } else {
      console.warn('⚠️ AWS S3 not configured - using local storage');
    }
  }

  // Configure multer for file uploads
  getMulterConfig(options: FileUploadOptions = {}) {
    const maxSize = options.maxSize || parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
    const allowedTypes = options.allowedTypes || (process.env.ALLOWED_FILE_TYPES || '').split(',');

    const storage = multer.memoryStorage();

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return cb(new Error(`File type ${file.mimetype} is not allowed`));
      }
      cb(null, true);
    };

    return multer({
      storage,
      limits: {
        fileSize: maxSize,
        files: 10, // Max 10 files per request
      },
      fileFilter,
    });
  }

  // Upload file to S3 or local storage
  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    familyId?: string,
    options: FileUploadOptions = {}
  ): Promise<UploadedFile> {
    try {
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileId}${fileExtension}`;
      const filePath = `${this.uploadPath}/${userId}/${fileName}`;

      let processedBuffer = file.buffer;
      let thumbnailBuffer: Buffer | undefined;

      // Process image files
      if (file.mimetype.startsWith('image/')) {
        if (options.compressImages !== false) {
          processedBuffer = await this.compressImage(file.buffer, file.mimetype);
        }

        if (options.generateThumbnails !== false) {
          thumbnailBuffer = await this.generateThumbnail(file.buffer);
        }
      }

      let fileUrl: string;
      let thumbnailUrl: string | undefined;

      if (this.s3Client) {
        // Upload to S3
        await this.uploadToS3(processedBuffer, filePath, file.mimetype);
        fileUrl = await this.getSignedUrl(filePath);

        if (thumbnailBuffer) {
          const thumbnailPath = `${this.uploadPath}/${userId}/thumbnails/${fileName}`;
          await this.uploadToS3(thumbnailBuffer, thumbnailPath, 'image/jpeg');
          thumbnailUrl = await this.getSignedUrl(thumbnailPath);
        }
      } else {
        // Local storage fallback
        fileUrl = await this.uploadToLocal(processedBuffer, filePath);
        
        if (thumbnailBuffer) {
          const thumbnailPath = `${this.uploadPath}/${userId}/thumbnails/${fileName}`;
          thumbnailUrl = await this.uploadToLocal(thumbnailBuffer, thumbnailPath);
        }
      }

      // Save file metadata to database
      const uploadedFile = await this.saveFileMetadata({
        id: fileId,
        originalName: file.originalname,
        fileName,
        mimeType: file.mimetype,
        size: processedBuffer.length,
        url: fileUrl,
        thumbnailUrl,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userId,
        familyId
      });

      return uploadedFile;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  private async uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<void> {
    if (!this.s3Client || !PutObjectCommand) throw new Error('S3 client not initialized');

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    });

    await this.s3Client.send(command);
  }

  private async uploadToLocal(buffer: Buffer, filePath: string): Promise<string> {
    const fullPath = path.join(process.cwd(), 'uploads', filePath);
    const dir = path.dirname(fullPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, buffer);
    return `/uploads/${filePath}`;
  }

  private async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.s3Client || !getSignedUrl || !GetObjectCommand) {
      return `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${key}`;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  private async compressImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
    try {
      const sharpInstance = sharp(buffer);
      
      // Get image metadata
      const metadata = await sharpInstance.metadata();
      
      // Resize if too large
      if (metadata.width && metadata.width > 1920) {
        sharpInstance.resize(1920, null, { withoutEnlargement: true });
      }

      // Compress based on format
      if (mimeType === 'image/jpeg') {
        return await sharpInstance.jpeg({ quality: 85, progressive: true }).toBuffer();
      } else if (mimeType === 'image/png') {
        return await sharpInstance.png({ compressionLevel: 8 }).toBuffer();
      } else if (mimeType === 'image/webp') {
        return await sharpInstance.webp({ quality: 85 }).toBuffer();
      }

      return buffer;
    } catch (error) {
      console.error('Image compression error:', error);
      return buffer; // Return original if compression fails
    }
  }

  private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw error;
    }
  }

  private async saveFileMetadata(fileData: UploadedFile): Promise<UploadedFile> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('files')
      .insert({
        id: fileData.id,
        original_name: fileData.originalName,
        file_name: fileData.fileName,
        mime_type: fileData.mimeType,
        size: fileData.size,
        url: fileData.url,
        thumbnail_url: fileData.thumbnailUrl,
        uploaded_at: fileData.uploadedAt,
        uploaded_by: fileData.uploadedBy,
        family_id: fileData.familyId
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save file metadata:', error);
      throw new Error('Failed to save file metadata');
    }

    return {
      id: data.id,
      originalName: data.original_name,
      fileName: data.file_name,
      mimeType: data.mime_type,
      size: data.size,
      url: data.url,
      thumbnailUrl: data.thumbnail_url,
      uploadedAt: data.uploaded_at,
      uploadedBy: data.uploaded_by,
      familyId: data.family_id
    };
  }

  // Get files for a user or hourse
  async getFiles(userId: string, familyId?: string, limit: number = 50, offset: number = 0): Promise<{
    files: UploadedFile[];
    total: number;
  }> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('files')
      .select('*', { count: 'exact' })
      .eq('uploaded_by', userId)
      .order('uploaded_at', { ascending: false })
      .range(parseInt(String(offset), 10), parseInt(String(offset), 10) + limit - 1);

    if (familyId) {
      query = query.eq('family_id', familyId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to get files:', error);
      throw new Error('Failed to get files');
    }

    const files: UploadedFile[] = (data || []).map(file => ({
      id: file.id,
      originalName: file.original_name,
      fileName: file.file_name,
      mimeType: file.mime_type,
      size: file.size,
      url: file.url,
      thumbnailUrl: file.thumbnail_url,
      uploadedAt: file.uploaded_at,
      uploadedBy: file.uploaded_by,
      familyId: file.family_id
    }));

    return {
      files,
      total: count || 0
    };
  }

  // Delete file
  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();

      // Get file metadata
      const { data: file, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .eq('uploaded_by', userId)
        .single();

      if (fetchError || !file) {
        throw new Error('File not found or access denied');
      }

      // Delete from storage
      if (this.s3Client) {
        const filePath = `${this.uploadPath}/${userId}/${file.file_name}`;
        await this.deleteFromS3(filePath);

        if (file.thumbnail_url) {
          const thumbnailPath = `${this.uploadPath}/${userId}/thumbnails/${file.file_name}`;
          await this.deleteFromS3(thumbnailPath);
        }
      } else {
        // Delete from local storage
        const filePath = path.join(process.cwd(), 'uploads', this.uploadPath, userId, file.file_name);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        const thumbnailPath = path.join(process.cwd(), 'uploads', this.uploadPath, userId, 'thumbnails', file.file_name);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
        .eq('uploaded_by', userId);

      if (deleteError) {
        console.error('Failed to delete file metadata:', deleteError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  private async deleteFromS3(key: string): Promise<void> {
    if (!this.s3Client || !DeleteObjectCommand) return;

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  // Get storage usage for a user
  async getStorageUsage(userId: string, familyId?: string): Promise<{
    totalSize: number;
    fileCount: number;
    limit: number;
  }> {
    const supabase = getSupabaseClient();

    let query = supabase
      .from('files')
      .select('size', { count: 'exact' })
      .eq('uploaded_by', userId);

    if (familyId) {
      query = query.eq('family_id', familyId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to get storage usage:', error);
      throw new Error('Failed to get storage usage');
    }

    const totalSize = (data || []).reduce((sum, file) => sum + file.size, 0);
    const limit = parseInt(process.env.STORAGE_LIMIT || '1073741824'); // 1GB default

    return {
      totalSize,
      fileCount: count || 0,
      limit
    };
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    if (this.s3Client && GetObjectCommand) {
      try {
        // Test S3 connection
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: 'health-check',
        });
        await this.s3Client.send(command);
        return true;
      } catch (error) {
        return false;
      }
    }
    return true; // Local storage is always available
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
