import { useState } from "react";
import { computeSAC } from "@/lib/sac";

type SacResult = ReturnType<typeof computeSAC>;

export const SacScreen = () => {
  const [form, setForm] = useState({
    bestSalary: "",
    workedDays: "",
    totalDays: "182",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});
  const [result, setResult] = useState<SacResult | null>(null);

  const num = (s: string) => Number((s || "0").replace(",", "."));

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setResult(null); // si cambian inputs, oculto resultados hasta recalcular
  }

  function validate() {
    const e: Partial<Record<keyof typeof form, string>> = {};
    const best = num(form.bestSalary);
    const worked = num(form.workedDays);
    const total = num(form.totalDays);

    if (!(best > 0))
      e.bestSalary = "Ingresá el mejor sueldo del semestre (mayor a 0).";
    if (!(total > 0))
      e.totalDays = "Ingresá los días totales del semestre (ej: 181/182/183).";
    if (!(worked >= 0)) e.workedDays = "Ingresá los días trabajados (0 o más).";
    if (total > 0 && worked > total)
      e.workedDays = "No puede superar los días del semestre.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    const input = {
      bestSalary: num(form.bestSalary),
      workedDays: num(form.workedDays),
      totalDays: num(form.totalDays),
    };
    setResult(computeSAC(input));
  }

  function handleReset() {
    setForm({ bestSalary: "", workedDays: "", totalDays: "182" });
    setErrors({});
    setResult(null);
  }

  return (
    <main
      className="container"
      style={{ padding: "24px 0", display: "grid", gap: 24 }}
    >
      <header>
        <h1>Aguinaldo (SAC)</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Fórmula:{" "}
          <strong>
            (Mejor sueldo ÷ 2) × (Días trabajados ÷ Días del semestre)
          </strong>
          .
        </p>
      </header>

      {/* Formulario */}
      <section
        className="card"
        style={{ padding: 16, display: "grid", gap: 12, maxWidth: 560 }}
      >
        {/* Mejor sueldo */}
        <div>
          <label>Mejor sueldo del semestre</label>
          <input
            inputMode="decimal"
            placeholder="Ej: 850000"
            value={form.bestSalary}
            onChange={(e) => set("bestSalary", e.target.value)}
          />
          <small
            style={{
              color: errors.bestSalary
                ? "var(--error)"
                : "var(--text-secondary)",
            }}
          >
            Sueldo bruto o neto según quieras estimar (sé consistente con cómo
            lo usás).
          </small>
          {errors.bestSalary && (
            <div style={{ color: "var(--error)" }}>{errors.bestSalary}</div>
          )}
        </div>

        {/* Días trabajados */}
        <div>
          <label>Días trabajados en el semestre</label>
          <input
            inputMode="numeric"
            placeholder="Ej: 170"
            value={form.workedDays}
            onChange={(e) => set("workedDays", e.target.value)}
          />
          <small
            style={{
              color: errors.workedDays
                ? "var(--error)"
                : "var(--text-secondary)",
            }}
          >
            Incluye solo los días efectivamente trabajados en el semestre
            (proporcional si ingresaste/egresaste).
          </small>
          {errors.workedDays && (
            <div style={{ color: "var(--error)" }}>{errors.workedDays}</div>
          )}
        </div>

        {/* Días del semestre */}
        <div>
          <label>Total de días del semestre</label>
          <input
            inputMode="numeric"
            placeholder="181 / 182 / 183"
            value={form.totalDays}
            onChange={(e) => set("totalDays", e.target.value)}
          />
          <small
            style={{
              color: errors.totalDays
                ? "var(--error)"
                : "var(--text-secondary)",
            }}
          >
            Tip: 1ᵉʳ semestre suele tener 181/182 días; 2ᵒ semestre 183/184
            según el año.
          </small>
          {errors.totalDays && (
            <div style={{ color: "var(--error)" }}>{errors.totalDays}</div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button type="button" className="button" onClick={handleCalculate}>
            Calcular
          </button>
          <button
            type="button"
            className="button button--outlined"
            onClick={handleReset}
          >
            Limpiar
          </button>
        </div>
      </section>

      {/* Resultados (solo tras calcular) */}
      {result && (
        <section
          className="card"
          style={{ padding: 16, display: "grid", gap: 8 }}
        >
          <h2>Resultado</h2>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>
              <strong>Base (mejor sueldo ÷ 2):</strong>{" "}
              {result.base.toLocaleString("es-AR")}
            </li>
            <li>
              <strong>Proporción trabajada:</strong>{" "}
              {(result.ratio * 100).toFixed(2)}%
            </li>
            <li>
              <strong>Aguinaldo estimado:</strong>{" "}
              {result.sac.toLocaleString("es-AR")}
            </li>
          </ul>
        </section>
      )}
    </main>
  );
};

export default SacScreen;
