import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { injectable } from 'tsyringe';

export interface UploadFileDTO {
  filename: string;
  buffer: Buffer;
  mimeType: string;
  folder?: string;
}

export interface IStorageProvider {
  upload(data: UploadFileDTO): Promise<{ key: string; url: string }>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

@injectable()
export class CloudflareR2Storage implements IStorageProvider {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
    this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async upload(data: UploadFileDTO): Promise<{ key: string; url: string }> {
    const timestamp = Date.now();
    const key = data.folder 
      ? `${data.folder}/${timestamp}-${data.filename}`
      : `uploads/${timestamp}-${data.filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: data.buffer,
      ContentType: data.mimeType,
    });

    await this.client.send(command);

    const url = `${this.publicUrl}/${key}`;

    return { key, url };
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
    return signedUrl;
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.client.send(command);
  }
}
