export type RoiInputs = {
  price: number;             // Precio de compra
  initialCosts: number;      // Gastos iniciales (escritura, comisión, etc.)
  rentMonthly: number;       // Alquiler mensual
  occupancyPct: number;      // 0..100
  expensesMonthly: number;   // Expensas + mantenimiento mensual
  taxesMonthly: number;      // Impuestos (ABL, ARBA prorrateado) mensual
  insuranceMonthly: number;  // Seguro mensual
  feesMonthly: number;       // Honorarios administración mensual
  annualOther: number;       // Otros costos anuales (si querés discriminar)
  discountRatePct?: number;  // opcional, para mostrar
};

export function computeROI(i: RoiInputs) {
  const occ = Math.max(0, Math.min(100, i.occupancyPct)) / 100;
  const incomeAnnual = i.rentMonthly * 12 * occ;

  const opexAnnual =
    (i.expensesMonthly + i.taxesMonthly + i.insuranceMonthly + i.feesMonthly) * 12 +
    i.annualOther;

  const NOI = incomeAnnual - opexAnnual;

  const capRate = i.price > 0 ? NOI / i.price : 0;

  const cashInvested = i.price + i.initialCosts;
  const cashOnCash = cashInvested > 0 ? NOI / cashInvested : 0;

  const paybackYears = NOI > 0 ? cashInvested / NOI : Infinity;

  return {
    incomeAnnual,
    opexAnnual,
    NOI,
    capRate,        // 0..1
    cashOnCash,     // 0..1
    paybackYears,   // años
  };
}

export function fmtPct(x: number) {
  return (x * 100).toFixed(2) + '%';
}

export function clampCurrency(n: number) {
  return isFinite(n) ? n : 0;
}
