import Head from "next/head";
import { useState } from "react";
import {
  toISO,
  parseNumber,
  valueAtOrBefore,
  factorBetween,
  type Point,
} from "@/lib/series-utils";
import PlazoForm, {
  type TipoPlazo,
  type FormTNA,
  type FormUVA,
} from "@/components/organisms/PlazoForm";
import PlazoResultado, {
  type PlazoResultadoData,
} from "@/components/organisms/PlazoResultado";

export default function PlazoFijoPage() {
  const [tipo, setTipo] = useState<TipoPlazo>("TNA");

  const [formTNA, setFormTNA] = useState<FormTNA>({
    capital: "",
    fechaInicio: "",
    fechaFin: "",
    tna: "70",
    base: "365",
  });

  const [formUVA, setFormUVA] = useState<FormUVA>({
    capital: "",
    fechaInicio: "",
    fechaFin: "",
    spread: "0",
  });

  const [error, setError] = useState("");
  const [res, setRes] = useState<PlazoResultadoData | null>(null);

  const diasEntre = (aISO: string, bISO: string) => {
    const a = new Date(aISO + "T00:00:00");
    const b = new Date(bISO + "T00:00:00");
    return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  };

  function resetAll() {
    setError("");
    setRes(null);
  }

  // Helpers para cambios de input: limpian error/resultado
  function onChangeTNA<K extends keyof FormTNA>(k: K, v: FormTNA[K]) {
    setFormTNA((f) => ({ ...f, [k]: v }));
    setError("");
    setRes(null);
  }
  function onChangeUVA<K extends keyof FormUVA>(k: K, v: FormUVA[K]) {
    setFormUVA((f) => ({ ...f, [k]: v }));
    setError("");
    setRes(null);
  }

  async function handleCalcular() {
    resetAll();

    if (tipo === "TNA") {
      const cap = parseNumber(formTNA.capital);
      if (!(cap > 0)) return setError("Ingresá un capital mayor a 0.");

      const fi = toISO(formTNA.fechaInicio);
      const ff = toISO(formTNA.fechaFin);
      if (fi.error) return setError(`Fecha inicio: ${fi.error}`);
      if (ff.error) return setError(`Fecha fin: ${ff.error}`);
      if (fi.iso! >= ff.iso!)
        return setError("La fecha fin debe ser posterior a la de inicio.");

      const dias = diasEntre(fi.iso!, ff.iso!);
      const tna = parseNumber(formTNA.tna) / 100;
      const base = formTNA.base === "360" ? 360 : 365;

      const interes = cap * tna * (dias / base);
      const montoFinal = cap + interes;

      setRes({
        montoFinal,
        intereses: interes,
        dias,
        detalle: {
          Capital: cap,
          "TNA %": parseNumber(formTNA.tna),
          Base: base,
          Interés: interes,
          "Monto final": montoFinal,
        },
      });

      // Normalizo en el form
      setFormTNA((f) => ({ ...f, fechaInicio: fi.iso!, fechaFin: ff.iso! }));
      return;
    }

    // UVA
    const cap = parseNumber(formUVA.capital);
    if (!(cap > 0)) return setError("Ingresá un capital mayor a 0.");

    const fi = toISO(formUVA.fechaInicio);
    const ff = toISO(formUVA.fechaFin);
    if (fi.error) return setError(`Fecha inicio: ${fi.error}`);
    if (ff.error) return setError(`Fecha fin: ${ff.error}`);
    if (fi.iso! >= ff.iso!)
      return setError("La fecha fin debe ser posterior a la de inicio.");

    const dias = diasEntre(fi.iso!, ff.iso!);
    const spread = parseNumber(formUVA.spread) / 100;

    // Traigo UVA
    const r = await fetch("/api/series/uva");
    if (!r.ok) {
      try {
        const p = await r.json();
        setError(p?.error || "No pude obtener la serie UVA. Probá más tarde.");
      } catch {
        setError("No pude obtener la serie UVA. Probá más tarde.");
      }
      return;
    }
    const payload = await r.json();
    const points: Point[] = payload?.points || [];

    const factor = factorBetween(points, fi.iso!, ff.iso!);
    if (factor == null)
      return setError("No hay datos de UVA para esas fechas.");

    const capitalAjustado = cap * factor;
    const interesSpread = capitalAjustado * spread * (dias / 365);
    const montoFinal = capitalAjustado + interesSpread;

    setRes({
      montoFinal,
      intereses: montoFinal - cap,
      dias,
      detalle: {
        "Capital inicial": cap,
        "UVA ini": valueAtOrBefore(points, fi.iso!) ?? NaN,
        "UVA fin": valueAtOrBefore(points, ff.iso!) ?? NaN,
        "Factor UVA": factor,
        "Spread % anual": parseNumber(formUVA.spread),
        "Interés spread": interesSpread,
        "Monto final": montoFinal,
      },
    });

    setFormUVA((f) => ({ ...f, fechaInicio: fi.iso!, fechaFin: ff.iso! }));
  }

  function handleReset() {
    setError("");
    setRes(null);
    setFormTNA({
      capital: "",
      fechaInicio: "",
      fechaFin: "",
      tna: "70",
      base: "365",
    });
    setFormUVA({ capital: "", fechaInicio: "", fechaFin: "", spread: "0" });
  }

  return (
    <>
      <Head>
        <title>Plazo fijo (TNA / UVA)</title>
        <meta
          name="description"
          content="Simulá un plazo fijo tradicional (TNA) o UVA. Cálculo simple y transparente."
        />
      </Head>

      <main
        className="container"
        style={{ paddingBlock: 24, display: "grid", gap: 24 }}
      >
        <header>
          <h1>Plazo fijo</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Tradicional: interés ≈ capital × (TNA/100) × días / base. UVA:
            capital × (UVA<sub>fin</sub>/UVA<sub>ini</sub>) más un spread anual
            opcional.
          </p>
        </header>

        <PlazoForm
          tipo={tipo}
          setTipo={(t) => {
            setTipo(t);
            resetAll();
          }}
          formTNA={formTNA}
          formUVA={formUVA}
          onChangeTNA={onChangeTNA}
          onChangeUVA={onChangeUVA}
          onCalculate={handleCalcular}
          onReset={handleReset}
          error={error}
        />

        {res && <PlazoResultado r={res} />}
      </main>
    </>
  );
}
