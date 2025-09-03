export type SacInputs = {
  bestSalary: number; // mejor remuneración del semestre
  workedDays: number; // días trabajados en el semestre
  totalDays: number;  // 181/182/183 según semestre y año (lo ingresás a mano)
};

export function computeSAC(i: SacInputs) {
  const base = i.bestSalary / 2;
  const ratio = i.totalDays > 0 ? i.workedDays / i.totalDays : 0;
  const sac = base * ratio;
  return { base, ratio, sac };
}