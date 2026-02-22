import { randomBytes } from 'crypto';

export function generateApiKey(): string {
  return 'qa_' + randomBytes(24).toString('hex');
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}
