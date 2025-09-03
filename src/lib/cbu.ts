// lib/cbu.ts
// Valida CBU/CVU (22 dígitos) usando módulo 10 con ponderadores oficiales.
// Bloque 1 (7 dígitos + DV): pesos 7-1-3-9-7-1-3
// Bloque 2 (13 dígitos + DV): pesos 3-9-7-1-3-9-7-1-3-9-7-1-3

export function onlyDigits(s: string) {
  return (s || '').replace(/\D+/g, '');
}

function mod10CheckDigit(digits: string, weights: number[]) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += Number(digits[i]) * weights[i];
  }
  const remainder = sum % 10;
  const diff = (10 - remainder) % 10; // si remainder==0 => diff 0
  return diff;
}

const W_BLOCK1 = [7,1,3,9,7,1,3];                // 7 dígitos
const W_BLOCK2 = [3,9,7,1,3,9,7,1,3,9,7,1,3];    // 13 dígitos

export function isValidCBUorCVU(input: string): boolean {
  const d = onlyDigits(input);
  if (d.length !== 22) return false;

  const block1 = d.slice(0, 7);
  const dv1    = Number(d[7]);
  const block2 = d.slice(8, 21);
  const dv2    = Number(d[21]);

  const calc1 = mod10CheckDigit(block1, W_BLOCK1);
  const calc2 = mod10CheckDigit(block2, W_BLOCK2);

  return dv1 === calc1 && dv2 === calc2;
}

export function format22(digits: string) {
  // Formato legible: 8-14 (XXXXXXXD-XXXXXXXXXXXXXD)
  const d = onlyDigits(digits).slice(0, 22);
  if (d.length <= 8) return d;
  return `${d.slice(0,8)}-${d.slice(8)}`;
}

export function guessType22(digits: string): 'CBU' | 'CVU' | 'Desconocido' {
  const d = onlyDigits(digits);
  if (d.length !== 22) return 'Desconocido';
  // Heurística simple: muchos CVU comienzan con "000"
  if (d.startsWith('000')) return 'CVU';
  return 'CBU';
}
