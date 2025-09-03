// Cálculos de Liquidación Final – Argentina (LCT).
// Basado en LCT: Antigüedad (art. 245), Preaviso (arts. 231/232/233),
// Vacaciones no gozadas (art. 156 y base art. 155), SAC proporcional (arts. 121-123).
//
// NOTA: Es una estimación general. Convenios, topes (art. 245/24.013), adicionales, y casos especiales
// pueden cambiar resultados. Permitimos campos manuales para ajustar.

export type TipoBaja = 'RENUNCIA' | 'DESPIDO_SIN_CAUSA';

export type InputsLiquidacion = {
  tipo: TipoBaja;

  // Fechas
  fechaIngreso: string;     // ISO yyyy-mm-dd
  fechaEgreso: string;      // ISO yyyy-mm-dd (fecha de notificación/egreso)

  // Remuneraciones base
  sueldoMensual: number;    // Remuneración mensual al cese (normal y habitual)
  bmnhArt245?: number;      // Mejor remuneración mensual normal y habitual (12 meses). Si no, usa sueldoMensual.
  mejorSueldoSemestre?: number; // Mejor remuneración mensual del semestre (para SAC). Si no, usa sueldoMensual.

  // Flags/ajustes
  huboPreaviso?: boolean;   // si hubo preaviso otorgado (para despido). Si true, no se liquida preaviso/integ.
  periodoPrueba?: boolean;  // si relación estaba en período de prueba al momento del despido
  diasMesTrabajadosExtra?: number; // ajuste manual de días efectivamente trabajados en el mes (default: por fecha)

  // Adicionales del mes (remunerativos) a prorratear con días trabajados
  otrosHaberesMes?: number;

  // Ajustes opcionales
  aplicarSACSobreVacaciones?: boolean; // por defecto true (doctrina y práctica)
};

export type ResultadoLiquidacion = {
  // Comunes
  diasTrabajadosMes: number;
  salarioDiasTrabajados: number;
  otrosHaberesMesProporc: number;
  sacProporcional: number;

  vacacionesDiasProporcionales: number; // redondeado
  vacacionesNoGozadas: number;
  sacSobreVacaciones: number;

  // Solo despido sin causa
  indemnizacionAntiguedad?: number;
  aniosPara245?: number;
  preaviso?: number;
  sacSobrePreaviso?: number;
  integracionMes?: number;
  sacSobreIntegracion?: number;

  // Totales
  totalRenuncia?: number;
  totalDespido?: number;
  detalle: Record<string, number>;
};

// --------- Utilidades de tiempo y fechas ---------

export function parseISO(d: string) {
  const [y, m, dd] = d.split('-').map(Number);
  return new Date(y, (m || 1) - 1, dd || 1);
}
export function daysInMonth(dt: Date) {
  return new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
}
export function isSameMonthYear(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
export function clamp(n: number) {
  return Number.isFinite(n) ? n : 0;
}

export function diffYMD(a: Date, b: Date) {
  // Diferencia aproximada a->b en Y/M/D (sin horas)
  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonthDays = daysInMonth(new Date(b.getFullYear(), b.getMonth(), 0));
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export function aniosParaIndemnizacion245(fechaIngresoISO: string, fechaEgresoISO: string) {
  const fi = parseISO(fechaIngresoISO);
  const fe = parseISO(fechaEgresoISO);
  const d = diffYMD(fi, fe);
  // Art. 245: años de servicio o fracción mayor de 3 meses => suma 1 año
  const fraccionMeses = d.months + (d.days > 0 ? 1/30 : 0);
  let anios = d.years + (fraccionMeses > 3 ? 1 : 0);
  if (anios < 1) anios = 1; // mínimo 1 (art. 245 piso: >= 1 mes, pero aquí computamos años para multiplicar)
  return anios;
}

export function antiguedadAniosExactos(fechaIngresoISO: string, fechaEgresoISO: string) {
  const { years, months, days } = diffYMD(parseISO(fechaIngresoISO), parseISO(fechaEgresoISO));
  return years + months / 12 + days / 365;
}

// --------- Vacaciones (art. 155 base, art. 156 proporc.) ---------

export function diasVacacionesPorAntiguedad(al31DicAnios: number) {
  if (al31DicAnios < 5) return 14;
  if (al31DicAnios < 10) return 21;
  if (al31DicAnios < 20) return 28;
  return 35;
}

export function diasTrabajadosEnElAnio(fechaIngresoISO: string, fechaEgresoISO: string) {
  const fe = parseISO(fechaEgresoISO);
  const inicioAnio = new Date(fe.getFullYear(), 0, 1);
  const inicio = parseISO(fechaIngresoISO) > inicioAnio ? parseISO(fechaIngresoISO) : inicioAnio;
  const diff = Math.ceil((fe.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(0, diff);
}

export function vacacionesProporcionalesDias(fechaIngresoISO: string, fechaEgresoISO: string) {
  const fe = parseISO(fechaEgresoISO);
  const al31Dic = new Date(fe.getFullYear(), 11, 31);
  const aniosAl31Dic = antiguedadAniosExactos(fechaIngresoISO, al31Dic.toISOString().slice(0,10));
  const diasDerecho = diasVacacionesPorAntiguedad(aniosAl31Dic);
  const trabajados = diasTrabajadosEnElAnio(fechaIngresoISO, fechaEgresoISO);
  // Regla práctica: si trabajó menos de 20 días en el año -> no corresponde (doctrina)
  if (trabajados < 20) return 0;
  const totalAnio = (fe.getFullYear() % 4 === 0 && (fe.getFullYear() % 100 !== 0 || fe.getFullYear() % 400 === 0)) ? 366 : 365;
  const proporcionales = (diasDerecho * trabajados) / totalAnio;
  return Math.round(proporcionales); // redondeo al entero más cercano
}

export function montoVacacionesNoGozadas(sueldoMensual: number, diasVacaciones: number) {
  // Art. 155: para mensualizados, valor día vacaciones = sueldo / 25.
  const valorDiaVac = sueldoMensual / 25;
  return clamp(valorDiaVac * diasVacaciones);
}

// --------- SAC proporcional (arts. 121-123) ---------

export function semestreDeFecha(fechaISO: string): 1 | 2 {
  const m = parseISO(fechaISO).getMonth() + 1;
  return (m >= 1 && m <= 6) ? 1 : 2;
}
export function diasSemestre(fechaISO: string) {
  const y = parseISO(fechaISO).getFullYear();
  const sem = semestreDeFecha(fechaISO);
  const start = sem === 1 ? new Date(y, 0, 1) : new Date(y, 6, 1);
  const end   = sem === 1 ? new Date(y, 5, 30) : new Date(y, 11, 31);
  const total = Math.ceil((end.getTime() - start.getTime()) / (1000*60*60*24)) + 1;
  return { start, end, total, sem };
}
export function diasTrabajadosSemestre(fechaIngresoISO: string, fechaEgresoISO: string) {
  const fe = parseISO(fechaEgresoISO);
  const { start, end } = diasSemestre(fechaEgresoISO);
  const inicio = parseISO(fechaIngresoISO) > start ? parseISO(fechaIngresoISO) : start;
  const fin = fe < end ? fe : end;
  const diff = Math.ceil((fin.getTime() - inicio.getTime()) / (1000*60*60*24)) + 1;
  return Math.max(0, diff);
}
export function sacProporcional(mejorDelSemestre: number, fechaIngresoISO: string, fechaEgresoISO: string) {
  const { total } = diasSemestre(fechaEgresoISO);
  const trabajados = diasTrabajadosSemestre(fechaIngresoISO, fechaEgresoISO);
  const base = mejorDelSemestre / 2; // mejor remuneración mensual del semestre / 2
  return clamp(base * (trabajados / total));
}

// --------- Mes de egreso: días trabajados e integración ---------

export function diasTrabajadosDelMes(fechaEgresoISO: string, override?: number) {
  const fe = parseISO(fechaEgresoISO);
  if (override != null && override >= 0) return override;
  return fe.getDate(); // días desde el 1 al día de egreso (incl)
}
export function salarioPorDiasMes(sueldoMensual: number, dias: number) {
  // Mensualizados: base 30 para días de mes
  const valorDia = sueldoMensual / 30;
  return clamp(valorDia * dias);
}
export function diasRestantesHastaFinDeMes(fechaEgresoISO: string) {
  const fe = parseISO(fechaEgresoISO);
  const dim = daysInMonth(fe);
  return Math.max(0, dim - fe.getDate()); // días faltantes desde día siguiente hasta último día
}

// --------- Preaviso (arts. 231/232) e Integración (art. 233) ---------

export function mesesPreaviso(antigAnios: number, periodoPrueba: boolean) {
  // Empleador sin preaviso:
  // 15 días en período de prueba; 1 mes (<5 años); 2 meses (>=5 años)
  if (periodoPrueba) return 0.5; // 15 días
  if (antigAnios < 5) return 1;
  return 2;
}

// --------- Motor principal ---------

export function calcularLiquidacion(i: InputsLiquidacion): ResultadoLiquidacion {
  const sueldo = i.sueldoMensual;
  const bmnh245 = i.bmnhArt245 && i.bmnhArt245 > 0 ? i.bmnhArt245 : sueldo;
  const sacBaseSem = i.mejorSueldoSemestre && i.mejorSueldoSemestre > 0 ? i.mejorSueldoSemestre : sueldo;
  const aplicarSACVac = i.aplicarSACSobreVacaciones !== false;

  const dTrabMes = diasTrabajadosDelMes(i.fechaEgreso, i.diasMesTrabajadosExtra);
  const salarioDias = salarioPorDiasMes(sueldo, dTrabMes);

  const otrosProp = salarioPorDiasMes(i.otrosHaberesMes || 0, dTrabMes); // proporcional a días del mes

  const sacProp = sacProporcional(sacBaseSem, i.fechaIngreso, i.fechaEgreso);

  const vacDias = vacacionesProporcionalesDias(i.fechaIngreso, i.fechaEgreso);
  const vacMonto = montoVacacionesNoGozadas(sueldo, vacDias);
  const sacVac = aplicarSACVac ? vacMonto * (1/12) : 0;

  const detalle: Record<string, number> = {
    'Salario por días trabajados del mes': salarioDias,
    'Otros haberes del mes (proporcional)': otrosProp,
    'SAC proporcional del semestre': sacProp,
    'Vacaciones no gozadas (art. 156)': vacMonto,
  };
  if (aplicarSACVac) detalle['SAC sobre vacaciones no gozadas'] = sacVac;

  let resultado: ResultadoLiquidacion = {
    diasTrabajadosMes: dTrabMes,
    salarioDiasTrabajados: salarioDias,
    otrosHaberesMesProporc: otrosProp,
    sacProporcional: sacProp,
    vacacionesDiasProporcionales: vacDias,
    vacacionesNoGozadas: vacMonto,
    sacSobreVacaciones: sacVac,
    detalle,
  };

  if (i.tipo === 'RENUNCIA') {
    const total = Object.values(detalle).reduce((a, b) => a + b, 0);
    resultado.totalRenuncia = clamp(total);
    return resultado;
  }

  // DESPIDO SIN CAUSA
  const anios245 = aniosParaIndemnizacion245(i.fechaIngreso, i.fechaEgreso);
  const indAntig = bmnh245 * anios245; // 1 mes por año o fracción > 3 meses (art. 245)

  detalle['Indemnización por antigüedad (art. 245)'] = indAntig;

  let preav = 0, sacPreav = 0, integ = 0, sacInteg = 0;
  if (!i.huboPreaviso) {
    const antigAniosExact = antiguedadAniosExactos(i.fechaIngreso, i.fechaEgreso);
    const meses = mesesPreaviso(antigAniosExact, !!i.periodoPrueba);
    preav = sueldo * meses;
    sacPreav = preav * (1/12); // SAC sobre preaviso omitido
    // Integración del mes de despido (art. 233): días restantes del mes si despido sin preaviso
    const diasRest = diasRestantesHastaFinDeMes(i.fechaEgreso);
    if (diasRest > 0) {
      integ = salarioPorDiasMes(sueldo, diasRest);
      sacInteg = integ * (1/12);
    }
    detalle['Indemnización sustitutiva de preaviso (arts. 231/232)'] = preav;
    if (sacPreav > 0) detalle['SAC sobre preaviso'] = sacPreav;
    if (integ > 0) detalle['Integración mes de despido (art. 233)'] = integ;
    if (sacInteg > 0) detalle['SAC sobre integración mes'] = sacInteg;
  }

  resultado.indemnizacionAntiguedad = indAntig;
  resultado.aniosPara245 = anios245;
  resultado.preaviso = preav;
  resultado.sacSobrePreaviso = sacPreav;
  resultado.integracionMes = integ;
  resultado.sacSobreIntegracion = sacInteg;

  const totalDesp = Object.values(detalle).reduce((a, b) => a + b, 0);
  resultado.totalDespido = clamp(totalDesp);
  return resultado;
}
