/**
 * Masks contact values for privacy in kiosk mode.
 * Shows just enough for the owner to recognize, but not enough to be useful to strangers.
 */

const BULLET = '\u2022';

function maskString(s: string, showFirst: number, showLast: number): string {
  if (s.length <= showFirst + showLast) return s;
  const masked = BULLET.repeat(Math.min(s.length - showFirst - showLast, 4));
  return s.slice(0, showFirst) + masked + s.slice(s.length - showLast);
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return BULLET.repeat(value.length);
  const last2 = digits.slice(-2);
  return BULLET.repeat(Math.min(digits.length - 2, 6)) + last2;
}

function maskEmail(value: string): string {
  const [local, domain] = value.split('@');
  if (!domain) return maskString(value, 1, 1);
  const dotIdx = domain.lastIndexOf('.');
  const domainName = dotIdx > 0 ? domain.slice(0, dotIdx) : domain;
  const tld = dotIdx > 0 ? domain.slice(dotIdx) : '';
  return maskString(local, 1, 1) + '@' + maskString(domainName, 1, 0) + tld;
}

function maskUsername(value: string): string {
  const prefix = value.startsWith('@') ? '@' : '';
  const name = value.startsWith('@') ? value.slice(1) : value;
  return prefix + maskString(name, 1, 1);
}

export function maskContact(method: string, value: string): string {
  if (!value) return '';
  switch (method) {
    case 'phone':
    case 'whatsapp':
      return maskPhone(value);
    case 'email':
      return maskEmail(value);
    case 'telegram':
    case 'instagram':
      return maskUsername(value);
    default:
      return maskString(value, 1, 1);
  }
}
