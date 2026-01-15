import { sql } from "./db";

/**
 * Sanitize input to prevent SQL injection and XSS attacks
 * @param input - The input string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous characters
  // This is a basic sanitization, but the primary protection comes from parameterized queries
  return input
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '') // Remove null bytes, backspaces, tabs, etc.
    .trim();
}

/**
 * Validate and sanitize numeric input
 * @param input - The input to validate
 * @param min - Minimum allowed value (optional)
 * @param max - Maximum allowed value (optional)
 * @returns The validated number or null if invalid
 */
export function validateNumericInput(input: any, min?: number, max?: number): number | null {
  if (input === null || input === undefined) {
    return null;
  }
  
  const num = parseInt(input.toString(), 10);
  
  if (isNaN(num)) {
    return null;
  }
  
  if (min !== undefined && num < min) {
    return null;
  }
  
  if (max !== undefined && num > max) {
    return null;
  }
  
  return num;
}

/**
 * Validate and sanitize date input
 * @param input - The date string to validate
 * @returns The validated date string in YYYY-MM-DD format or null if invalid
 */
export function validateDateInput(input: string): string | null {
  if (!input) {
    return null;
  }
  
  // Basic format validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(input)) {
    return null;
  }
  
  // Additional validation to ensure it's a real date
  const date = new Date(input);
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return input;
}

/**
 * Validate and sanitize time input
 * @param input - The time string to validate (HH:MM format)
 * @returns The validated time string or null if invalid
 */
export function validateTimeInput(input: string): string | null {
  if (!input) {
    return null;
  }
  
  // Basic format validation (HH:MM)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(input)) {
    return null;
  }
  
  return input;
}

/**
 * Validate and sanitize string input with length constraints
 * @param input - The input string to validate
 * @param maxLength - Maximum allowed length (default: 255)
 * @param minLength - Minimum required length (default: 0)
 * @returns The validated string or null if invalid
 */
export function validateStringInput(input: any, maxLength: number = 255, minLength: number = 0): string | null {
  if (input === null || input === undefined) {
    return null;
  }
  
  const str = input.toString().trim();
  
  if (str.length < minLength) {
    return null;
  }
  
  if (str.length > maxLength) {
    return str.substring(0, maxLength);
  }
  
  return str;
}

/**
 * Validate email format
 * @param email - The email to validate
 * @returns The validated email or null if invalid
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return null;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return null;
  }
  
  return email.toLowerCase().trim();
}

/**
 * Escape HTML characters to prevent XSS
 * @param input - The input string to escape
 * @returns The escaped string
 */
export function escapeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
