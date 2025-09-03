import Head from "next/head";
import { useMemo, useState } from "react";
import {
  onlyDigits,
  formatCuitMask,
  formatCUIT,
  isValidCUIT,
  generateCUITFromDNI,
  type Gender,
} from "@/lib/cuit";

export default function CuitPage() {
  // Validador
  const [cuitInput, setCuitInput] = useState(""); // guardamos con guiones

  // Generador
  const [dni, setDni] = useState("");
  const [gender, setGender] = useState<Gender>("H"); // 'H' Hombre, 'M' Mujer, 'X' No binario (X)

  // Validación en vivo
  const valid = useMemo(() => {
    const digits = onlyDigits(cuitInput);
    if (!digits) return null;
    return isValidCUIT(digits);
  }, [cuitInput]);

  // Generación en vivo (1 resultado)
  const generated = useMemo(() => {
    if (!dni || !gender) return null;
    return generateCUITFromDNI(dni, gender);
  }, [dni, gender]);

  function handleCuitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = onlyDigits(e.target.value).slice(0, 11);
    setCuitInput(formatCuitMask(digits));
  }

  function handleDniChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = onlyDigits(e.target.value).slice(0, 8); // DNI 7 u 8
    setDni(digits);
  }

  return (
    <>
      <Head>
        <title>CUIT / DNI</title>
        <meta
          name="description"
          content="Validá un CUIT con guiones en vivo o generálo desde DNI eligiendo Hombre, Mujer o X."
        />
      </Head>

      <main
        className="container"
        style={{ paddingBlock: "24px", display: "grid", gap: 24 }}
      >
        <header>
          <h1>CUIT / DNI</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Validá un CUIT (formato XX-XXXXXXXX-X) o generálo a partir de un DNI
            indicando el género.
          </p>
        </header>

        {/* === Validar CUIT =================================================== */}
        <section
          className="card"
          style={{ padding: 16, display: "grid", gap: 12 }}
        >
          <h2>Validar CUIT</h2>

          <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
            <label htmlFor="cuit">CUIT</label>
            <input
              id="cuit"
              inputMode="numeric"
              placeholder="20-12345678-9"
              value={cuitInput}
              onChange={handleCuitChange}
            />

            {cuitInput && (
              <div
                style={{
                  fontWeight: 600,
                  color: valid ? "var(--success)" : "var(--error)",
                }}
              >
                {valid
                  ? `CUIT válido: ${formatCUIT(cuitInput)}`
                  : "CUIT inválido"}
              </div>
            )}
          </div>
        </section>

        {/* === Generar CUIT desde DNI ======================================== */}
        <section
          className="card"
          style={{ padding: 16, display: "grid", gap: 12 }}
        >
          <h2>Generar CUIT desde DNI</h2>

          <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="dni">DNI (7 u 8 dígitos)</label>
              <input
                id="dni"
                inputMode="numeric"
                placeholder="12345678"
                value={dni}
                onChange={handleDniChange}
              />
              {!!dni && (dni.length < 7 || dni.length > 8) && (
                <div style={{ color: "var(--error)" }}>
                  Ingresá 7 u 8 dígitos de DNI.
                </div>
              )}
            </div>

            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="visually-hidden">Género</legend>
              <div style={{ display: "flex", gap: 12 }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <input
                    type="radio"
                    name="gender"
                    value="H"
                    checked={gender === "H"}
                    onChange={() => setGender("H")}
                  />
                  Hombre
                </label>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={gender === "M"}
                    onChange={() => setGender("M")}
                  />
                  Mujer
                </label>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <input
                    type="radio"
                    name="gender"
                    value="X"
                    checked={gender === "X"}
                    onChange={() => setGender("X")}
                  />
                  X
                </label>
              </div>
            </fieldset>

            <div style={{ marginTop: 4 }}>
              {dni && dni.length >= 7 && dni.length <= 8 ? (
                generated ? (
                  <div style={{ fontWeight: 600 }}>
                    CUIT generado: <span>{generated}</span>
                  </div>
                ) : (
                  <div style={{ color: "var(--error)" }}>
                    No se pudo generar el CUIT. Revisá el DNI.
                  </div>
                )
              ) : (
                <div style={{ color: "var(--text-secondary)" }}>
                  Ingresá el DNI y elegí Hombre, Mujer o X.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
