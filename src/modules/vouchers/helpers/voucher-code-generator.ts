/**
 * Generates a unique voucher code based on customizable patterns
 * @param prefix - Optional prefix for the voucher code
 * @param suffix - Optional suffix for the voucher code
 * @param length - Length of the random part (default: 8)
 * @param existingCodes - Set of existing codes to avoid duplicates
 * @returns Generated voucher code
 */
export const generateVoucherCode = (
  prefix: string = '',
  suffix: string = '',
  length: number = 8,
  existingCodes: Set<string> = new Set()
): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    let randomPart = '';
    for (let i = 0; i < length; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const code = `${prefix}${randomPart}${suffix}`.toUpperCase();

    if (!existingCodes.has(code)) {
      return code;
    }

    attempts++;
  }

  throw new Error(
    'Failed to generate unique voucher code after maximum attempts'
  );
};

/**
 * Generates multiple unique voucher codes
 * @param count - Number of codes to generate
 * @param prefix - Optional prefix for the voucher codes
 * @param suffix - Optional suffix for the voucher codes
 * @param length - Length of the random part (default: 8)
 * @param existingCodes - Set of existing codes to avoid duplicates
 * @returns Array of generated voucher codes
 */
export const generateBulkVoucherCodes = (
  count: number,
  prefix: string = '',
  suffix: string = '',
  length: number = 8,
  existingCodes: Set<string> = new Set()
): string[] => {
  const codes: string[] = [];
  const usedCodes = new Set<string>([...existingCodes]);

  for (let i = 0; i < count; i++) {
    const code = generateVoucherCode(prefix, suffix, length, usedCodes);
    codes.push(code);
    usedCodes.add(code);
  }

  return codes;
};
