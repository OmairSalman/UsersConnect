/**
 * Check if SMTP is properly configured
 * Returns true if all required SMTP environment variables are set
 */
export function isSMTPConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  );
}