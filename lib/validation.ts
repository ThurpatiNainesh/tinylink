import { z } from 'zod';

export const urlSchema = z.string().url({ message: 'Please enter a valid URL' });

export const codeSchema = z
  .string()
  .min(3, 'Code must be at least 3 characters')
  .max(20, 'Code must be at most 20 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Code can only contain letters, numbers, hyphens, and underscores'
  )
  .transform((val) => val.toLowerCase());

export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    new URL(url);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'Invalid URL' };
  }
}

export function sanitizeInput(input: string): string {
  return input.trim();
}
