
export type Gender = 'H' | 'M' | 'X';

const WEIGHTS = [5,4,3,2,7,6,5,4,3,2];
const PREFIX_BY_GENDER: Record<Gender, number> = {
  H: 20, // Hombre
  M: 27, // Mujer
  X: 24, // No binario (X)
};

export const GENDER_LABEL: Record<Gender, string> = {
  H: 'Hombre',
  M: 'Mujer',
  X: 'X',
};

export function getGenderPrefix(g: Gender): number {
  return PREFIX_BY_GENDER[g];
}

export function onlyDigits(s: string) {
  return (s || '').replace(/\D+/g, '');
}

export function formatCuitMask(digitsOnly: string) {
  const d = onlyDigits(digitsOnly).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 10) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`;
}

export function formatCUIT(digits: string) {
  const clean = onlyDigits(digits);
  if (clean.length !== 11) return formatCuitMask(clean);
  return `${clean.slice(0,2)}-${clean.slice(2,10)}-${clean.slice(10)}`;
}

export function calcCheckDigit(first10: string): number {
  const digits = first10.split('').map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * WEIGHTS[i], 0);
  const mod = sum % 11;
  const dv = 11 - mod;
  if (dv === 11) return 0;
  if (dv === 10) return 9;
  return dv;
}

export function isValidCUIT(input: string): boolean {
  const digits = onlyDigits(input);
  if (digits.length !== 11) return false;
  const first10 = digits.slice(0, 10);
  const dv = Number(digits[10]);
  return calcCheckDigit(first10) === dv;
}

export function generateCUITFromDNI(dni: string, gender: Gender): string | null {
  const d = onlyDigits(dni);
  if (d.length < 7 || d.length > 8) return null;
  const pref = PREFIX_BY_GENDER[gender];
  const base10 = `${pref}${d.padStart(8, '0')}`;
  const dv = calcCheckDigit(base10);
  const full = base10 + String(dv);
  return formatCUIT(full);
}
