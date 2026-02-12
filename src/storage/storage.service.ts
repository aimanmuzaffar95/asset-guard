import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly endpoint: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>(
      'SUPABASE_STORAGE_ENDPOINT',
    );
    const region = this.configService.get<string>('SUPABASE_STORAGE_REGION');
    const bucketName = this.configService.get<string>(
      'SUPABASE_STORAGE_BUCKET',
    );
    const accessKeyId = this.configService.get<string>(
      'SUPABASE_STORAGE_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.configService.get<string>(
      'SUPABASE_STORAGE_SECRET_ACCESS_KEY',
    );

    if (
      !endpoint ||
      !region ||
      !bucketName ||
      !accessKeyId ||
      !secretAccessKey
    ) {
      throw new Error('Missing required Supabase storage configuration');
    }

    this.endpoint = endpoint;
    this.region = region;
    this.bucketName = bucketName;

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });

    this.logger.log(
      `Storage service initialized with bucket: ${this.bucketName}`,
    );
  }

  /**
   * Upload a file to Supabase S3 storage
   * @param file - The file buffer to upload
   * @param originalName - Original filename
   * @param mimetype - File MIME type
   * @returns The public URL of the uploaded file
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimetype: string,
  ): Promise<string> {
    try {
      const fileExtension = originalName.split('.').pop();
      const uniqueFileName = `profile-images/${uuidv4()}.${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueFileName,
        Body: file,
        ContentType: mimetype,
      });

      await this.s3Client.send(command);

      // Construct the public URL
      // Format: https://{project-ref}.supabase.co/storage/v1/object/public/{bucket-name}/{file-path}
      const publicUrl = `${this.endpoint.replace('/s3', '')}/object/public/${this.bucketName}/${uniqueFileName}`;

      this.logger.log(`File uploaded successfully: ${uniqueFileName}`);
      return publicUrl;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to upload file: ${err.message}`, err.stack);
      throw new Error(`File upload failed: ${err.message}`);
    }
  }

  /**
   * Delete a file from Supabase S3 storage
   * @param fileUrl - The public URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the file key from the URL
      const urlParts = fileUrl.split(`${this.bucketName}/`);
      if (urlParts.length < 2) {
        throw new Error('Invalid file URL');
      }
      const fileKey = urlParts[1];

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to delete file: ${err.message}`, err.stack);
      throw new Error(`File deletion failed: ${err.message}`);
    }
  }
}
