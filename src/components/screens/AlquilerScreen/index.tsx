/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  factorBetween,
  toISO,
  parseNumber,
  type Point,
} from "@/lib/series-utils";
import AlquilerForm, {
  type AlquilerFormState,
} from "@/components/organisms/AlquilerForm";
import AlquilerResultado, {
  type AlquilerResultadoData,
} from "@/components/organisms/AlquilerResultado";

export default function AumentoAlquilerPage() {
  const [form, setForm] = useState<AlquilerFormState>({
    indice: "cer",
    montoActual: "",
    fechaBase: "",
    fechaAjuste: "",
  });

  const [error, setError] = useState<string>("");
  const [resultado, setResultado] = useState<AlquilerResultadoData | null>(
    null
  );

  function setField<K extends keyof AlquilerFormState>(
    k: K,
    v: AlquilerFormState[K]
  ) {
    setForm((f) => ({ ...f, [k]: v }));
    setResultado(null);
    setError("");
  }

  async function handleCalcular() {
    setError("");
    setResultado(null);

    // Validaciones
    const monto = parseNumber(form.montoActual);
    if (!(monto > 0)) {
      setError("Ingresá el monto actual (> 0).");
      return;
    }
    const b = toISO(form.fechaBase);
    const t = toISO(form.fechaAjuste);
    if (b.error) return setError(`Fecha base: ${b.error}`);
    if (t.error) return setError(`Fecha de ajuste: ${t.error}`);
    if (b.iso! > t.iso!)
      return setError("La fecha base no puede ser posterior a la de ajuste.");

    // Serie
    const resp = await fetch(`/api/series/${form.indice}`);
    let payload: any = null;
    try {
      payload = await resp.json();
    } catch {}
    if (!resp.ok) {
      setError(
        payload?.error ||
          "No pude obtener la serie del índice. Probá de nuevo en unos minutos."
      );
      return;
    }
    const points: Point[] = payload?.points || [];

    // Factor
    const factor = factorBetween(points, b.iso!, t.iso!);
    if (factor == null) {
      setError(
        "No hay datos suficientes para esas fechas en la serie seleccionada."
      );
      return;
    }

    const nuevoMonto = monto * factor;

    setResultado({
      factor,
      nuevoMonto,
      lastUpdated: payload?.lastUpdated ?? null,
    });

    // Normalizo fechas
    setForm((f) => ({ ...f, fechaBase: b.iso!, fechaAjuste: t.iso! }));
  }

  function handleReset() {
    setForm({ indice: "cer", montoActual: "", fechaBase: "", fechaAjuste: "" });
    setError("");
    setResultado(null);
  }

  return (
    <>
      <main
        className="container"
        style={{ paddingBlock: 24, display: "grid", gap: 24 }}
      >
        <header>
          <h1>Aumento de alquiler</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Factor = índice(<em>fecha de ajuste</em>) ÷ índice(
            <em>fecha base</em>). Si no hay dato exacto, se usa el último
            disponible anterior o igual.
          </p>
        </header>

        <AlquilerForm
          form={form}
          onChange={setField}
          onCalculate={handleCalcular}
          onReset={handleReset}
          error={error}
        />

        {resultado && <AlquilerResultado r={resultado} />}
      </main>
    </>
  );
}
