import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import logger from '../config/logger';

export class S3Service
{
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor()
  {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || "us-east-1";

    this.s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      ...(endpoint && {
        endpoint: endpoint,
        forcePathStyle: true,
      }),
    });

    this.bucketName = process.env.S3_BUCKET_NAME!;

    this.publicUrl = process.env.S3_PUBLIC_URL ||
      (endpoint
        ? `${endpoint}/${this.bucketName}`
        : `https://${this.bucketName}.s3.${region}.amazonaws.com`);
  }

  async uploadPostImage(file: Express.Multer.File, userId: string): Promise<string>
  {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `posts/${userId}-${crypto.randomBytes(8).toString("hex")}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `${this.publicUrl}/${fileName}`;
  }

  async deletePostImage(imageURL: string): Promise<void>
  {
    try {
      // Extract the key from the URL
      // URL format: https://bucket.s3.region.amazonaws.com/posts/userid-hash.ext
      // or: https://endpoint/bucket/posts/userid-hash.ext
      const url = new URL(imageURL);
      let key = url.pathname;

      // Remove leading slash and bucket name if present in path
      key = key.replace(/^\//, '');
      if (key.startsWith(this.bucketName + '/')) {
        key = key.substring(this.bucketName.length + 1);
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      logger.info(`Deleted image from S3: ${key}`);
    } catch (error) {
      logger.error('Error deleting image from S3:', error);
      // Don't throw - we don't want to fail the whole operation if S3 delete fails
    }
  }

  async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string>
  {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `profile-pictures/${userId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `${this.publicUrl}/${fileName}`;
  }

  async deleteProfilePicture(imageURL: string): Promise<void>
  {
    try {
      const url = new URL(imageURL);
      let key = url.pathname;

      // Remove leading slash and bucket name if present in path
      key = key.replace(/^\//, '');
      if (key.startsWith(this.bucketName + '/')) {
        key = key.substring(this.bucketName.length + 1);
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      logger.info(`Deleted profile picture from S3: ${key}`);
    } catch (error) {
      logger.error('Error deleting profile picture from S3:', error);
    }
  }
}