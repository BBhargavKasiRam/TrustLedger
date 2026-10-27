/**
 * AICTE Requirement 10: Financial & Statutory Identity Data Masking Helper
 * Prevents plain-text rendering of sensitive financial identifiers in production UI views.
 */

export type MaskType = 'bank_account' | 'pan' | 'aadhaar' | 'ifsc' | 'generic';

export function maskFinancialId(value: string | number | null | undefined, type: MaskType = 'bank_account'): string {
  if (!value) return 'XXXX-XXXX';
  const str = String(value).trim();

  switch (type) {
    case 'bank_account': {
      if (str.length <= 4) return 'XXXX-' + str;
      const last4 = str.slice(-4);
      return `XXXX-XXXX-${last4}`;
    }

    case 'pan': {
      if (str.length < 5) return 'XXXXX-XXXX';
      const firstPart = str.slice(0, 3);
      const lastChar = str.slice(-1);
      return `${firstPart}XX-XXXX-${lastChar}`;
    }

    case 'aadhaar': {
      if (str.length <= 4) return 'XXXX-XXXX-XXXX';
      const last4 = str.slice(-4);
      return `XXXX-XXXX-${last4}`;
    }

    case 'ifsc': {
      if (str.length <= 4) return str;
      return str.slice(0, 4) + '0***' + str.slice(-2);
    }

    case 'generic':
    default: {
      if (str.length <= 4) return '****';
      return '****' + str.slice(-4);
    }
  }
}
