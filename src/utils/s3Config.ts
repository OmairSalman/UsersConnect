import { config } from '../config';

/**
 * Check if S3 storage is properly configured
 * Returns true if all required S3 settings are set
 */
export function isS3Configured(): boolean {
  return !!(
    config.s3?.accessKey &&
    config.s3?.secretKey &&
    config.s3?.bucketName
  );
}