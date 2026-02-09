/**
 * Check if S3 storage is properly configured
 * Returns true if all required S3 environment variables are set
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.S3_ACCESS_KEY &&
    process.env.S3_SECRET_KEY &&
    process.env.S3_BUCKET_NAME
  );
}
