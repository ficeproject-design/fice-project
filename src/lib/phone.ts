/** Shared phone validation for customer WhatsApp numbers (ID). */

export function cleanPhoneDigits(raw: string): string {
  return (raw || '').replace(/[^0-9]/g, '');
}

/**
 * Strict ID mobile validation:
 * - digits only after stripping spaces/dashes/plus
 * - 10–14 digits (covers 08xx… and 628xx… forms)
 * - must start with 0 or 62
 */
export function isValidPhone(raw: string): boolean {
  const digits = cleanPhoneDigits(raw);
  if (!/^[0-9]{10,14}$/.test(digits)) return false;
  return digits.startsWith('0') || digits.startsWith('62');
}

export const PHONE_HINT =
  'Nomor WhatsApp 10–14 digit, diawali 08 atau 62 (contoh: 081234567890).';
