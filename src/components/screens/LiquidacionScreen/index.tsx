import { useState } from "react";
import LiquidacionForm, {
  type LiqErrors,
} from "@/components/organisms/LiquidacionForm";
import LiquidacionResultados from "@/components/organisms/LiquidacionResultados";
import { InputsLiquidacion, calcularLiquidacion } from "@/lib/liquidacion";

const initialForm: InputsLiquidacion = {
  tipo: "RENUNCIA",
  fechaIngreso: "",
  fechaEgreso: "",
  sueldoMensual: 0,
  aplicarSACSobreVacaciones: true,
  huboPreaviso: false,
  periodoPrueba: false,
  otrosHaberesMes: 0,
};

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function toISO(raw: string): { iso?: string; error?: string } {
  const s = (raw || "").trim();
  if (!s) return { error: "Campo requerido." };

  // AAAA-MM-DD (input type="date")
  if (ISO_RE.test(s)) {
    const [y, m, d] = s.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const ok =
      dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
    return ok ? { iso: s } : { error: "La fecha no existe." };
  }

  // DD/MM/AAAA o DD-MM-AAAA
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const dd = Number(m[1]),
      mm = Number(m[2]),
      yy = Number(m[3]);
    const dt = new Date(yy, mm - 1, dd);
    const ok =
      dt.getFullYear() === yy &&
      dt.getMonth() === mm - 1 &&
      dt.getDate() === dd;
    if (!ok) return { error: "La fecha no existe." };
    const iso = `${yy.toString().padStart(4, "0")}-${mm
      .toString()
      .padStart(2, "0")}-${dd.toString().padStart(2, "0")}`;
    return { iso };
  }

  return { error: "Formato inválido (usá AAAA-MM-DD o DD/MM/AAAA)." };
}

const LiquidacionScreen: React.FC = () => {
  const [form, setForm] = useState<InputsLiquidacion>(initialForm);
  const [errors, setErrors] = useState<LiqErrors>({});
  const [result, setResult] = useState<ReturnType<
    typeof calcularLiquidacion
  > | null>(null);

  const setField = <K extends keyof InputsLiquidacion>(
    k: K,
    v: InputsLiquidacion[K]
  ) => {
    setForm((f) => ({ ...f, [k]: v }));
    setResult(null);
  };

  const validateAndNormalize = () => {
    const e: LiqErrors = {};

    const fi = toISO(form.fechaIngreso);
    const fe = toISO(form.fechaEgreso);

    if (fi.error) e.fechaIngreso = fi.error;
    if (fe.error) e.fechaEgreso = fe.error;

    if (!fi.error && !fe.error && fi.iso! > fe.iso!) {
      e.interno =
        "La fecha de ingreso no puede ser posterior a la fecha de egreso.";
    }

    if (!(form.sueldoMensual > 0)) {
      e.sueldoMensual = "Ingresá el sueldo mensual al cese (> 0).";
    }

    setErrors(e);

    const ok = Object.keys(e).length === 0;
    return { ok, fi, fe };
  };

  const handleCalculate = () => {
    const { ok, fi, fe } = validateAndNormalize();
    if (!ok) return;

    // normalizo el form en pantalla para que quede ISO en los <input type="date">
    setForm((f) => ({ ...f, fechaIngreso: fi.iso!, fechaEgreso: fe.iso! }));

    const fixed: InputsLiquidacion = {
      ...form,
      fechaIngreso: fi.iso!,
      fechaEgreso: fe.iso!,
    };

    const r = calcularLiquidacion(fixed);
    setResult(r);
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setResult(null);
  };

  return (
    <main
      className="container"
      style={{ padding: "24px 0", display: "grid", gap: 24 }}
    >
      <header>
        <h1>Liquidación Final (Argentina)</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Elegí el tipo de desvinculación y completá los datos. Presioná{" "}
          <strong>Calcular</strong> para ver el resultado.
        </p>
      </header>

      <LiquidacionForm
        form={form}
        errors={errors}
        onChange={setField}
        onCalculate={handleCalculate}
        onReset={handleReset}
      />

      {result && <LiquidacionResultados r={result} tipo={form.tipo} />}
    </main>
  );
};

export default LiquidacionScreen;
