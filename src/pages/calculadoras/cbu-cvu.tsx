import Head from "next/head";
import { useMemo, useState } from "react";
import {
  isValidCBUorCVU,
  onlyDigits,
  format22,
  guessType22,
} from "../../lib/cbu";

export default function CbuCvuPage() {
  const [val, setVal] = useState("");
  const clean = onlyDigits(val);
  const formatted = format22(val);

  const validity = useMemo(() => {
    if (clean.length < 22) return null;
    return isValidCBUorCVU(clean);
  }, [clean]);

  const kind = useMemo(() => {
    if (clean.length !== 22) return "Desconocido";
    return guessType22(clean);
  }, [clean]);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  return (
    <>
      <Head>
        <title>Validador CBU / CVU</title>
        <meta
          name="description"
          content="Validá un CBU o CVU (22 dígitos) con verificación oficial por módulo 10."
        />
      </Head>

      <main
        className="container"
        style={{ paddingBlock: 24, display: "grid", gap: 24 }}
      >
        <header>
          <h1>CBU / CVU</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Ingresá 22 dígitos. Validación oficial por módulo 10 (dos bloques).
          </p>
        </header>

        <section
          className="card"
          style={{ padding: 16, display: "grid", gap: 12 }}
        >
          <label htmlFor="cbu">CBU/CVU (22 dígitos)</label>
          <input
            id="cbu"
            inputMode="numeric"
            placeholder="XXXXXXXX-XXXXXXXXXXXXXX"
            value={formatted}
            onChange={(e) => setVal(e.target.value)}
          />

          {clean.length === 22 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <strong
                style={{ color: validity ? "var(--success)" : "var(--error)" }}
              >
                {validity ? "Válido" : "Inválido"}
              </strong>
              <span style={{ color: "var(--text-secondary)" }}>
                Tipo: {kind}
              </span>
              {validity && (
                <button
                  className="button button--outlined"
                  onClick={() => copy(clean)}
                >
                  Copiar (22 dígitos)
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
