/**
 * Validates an email address format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates password strength: min 8 chars, 1 uppercase, 1 number.
 */
export function isStrongPassword(password: string): boolean {
  return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

/**
 * Validates a URL string.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns validation error messages for a user form.
 */
export function validateUserForm(data: { name: string; email: string; password: string }) {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) errors.name = 'Name is required.';
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
  if (!isStrongPassword(data.password))
    errors.password = 'Password must be 8+ chars with 1 uppercase and 1 number.';

  return errors;
}
