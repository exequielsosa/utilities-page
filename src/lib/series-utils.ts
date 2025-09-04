// lib/series-utils.ts
export type Point = { date: string; value: number };

/** Convierte DD/MM/AAAA o AAAA-MM-DD a ISO AAAA-MM-DD; valida la existencia */
export function toISO(raw: string): { iso?: string; error?: string } {
  const s = (raw || "").trim();
  if (!s) return { error: "Campo requerido" };

  const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (ISO_RE.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const ok = dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
    return ok ? { iso: s } : { error: "La fecha no existe" };
  }

  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const dd = +m[1], mm = +m[2], yy = +m[3];
    const dt = new Date(yy, mm - 1, dd);
    const ok = dt.getFullYear() === yy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
    if (!ok) return { error: "La fecha no existe" };
    const iso = `${yy.toString().padStart(4,"0")}-${mm.toString().padStart(2,"0")}-${dd.toString().padStart(2,"0")}`;
    return { iso };
  }

  return { error: "Formato inválido (AAAA-MM-DD o DD/MM/AAAA)" };
}

/** Asegura orden por fecha ascendente (por las dudas) */
export function normalizePoints(points: Point[]): Point[] {
  return [...(points || [])].sort((a, b) => a.date.localeCompare(b.date));
}

/** Valor en 'date' o el último <= date; si no hay, null */
export function valueAtOrBefore(points: Point[], dateISO: string): number | null {
  const p = normalizePoints(points);
  if (!p.length) return null;
  let lo = 0, hi = p.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cmp = p[mid].date.localeCompare(dateISO);
    if (cmp <= 0) { ans = mid; lo = mid + 1; } else { hi = mid - 1; }
  }
  return ans >= 0 ? p[ans].value : null;
}

/** Factor = valor(target) / valor(base); si falta alguno → null */
export function factorBetween(points: Point[], baseISO: string, targetISO: string): number | null {
  const a = valueAtOrBefore(points, baseISO);
  const b = valueAtOrBefore(points, targetISO);
  if (a == null || b == null || a === 0) return null;
  return b / a;
}

/** Convierte texto con coma o punto decimal a número */
export function parseNumber(s: string): number {
  return Number((s || "0").replace(",", "."));
}
