import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
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

  async uploadPostImage(file: Express.Multer.File, userId: string): Promise<string> {
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
}