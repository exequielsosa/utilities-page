import { useMemo, useState } from "react";
import {
  onlyDigits,
  generateCUITFromDNI,
  getGenderPrefix,
  GENDER_LABEL,
  type Gender,
} from "@/lib/cuit";

export const GenerarCuit = () => {
  // Generar CUIT
  const [dni, setDni] = useState("");
  const [gender, setGender] = useState<Gender>("H");
  const generated = useMemo(() => {
    if (!dni) return null;
    return generateCUITFromDNI(dni, gender);
  }, [dni, gender]);

  // Copiar

  const [copiedGenerated, setCopiedGenerated] = useState(false);

  async function copyToClipboard(text: string, setFlag: (b: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setFlag(true);
    setTimeout(() => setFlag(false), 1500);
  }

  function handleDniChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = onlyDigits(e.target.value).slice(0, 8);
    setDni(digits);
  }

  return (
    <>
      {/* Generar CUIT desde DNI */}
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
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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

          <small style={{ color: "var(--text-secondary)" }}>
            Prefijo usado: <strong>{getGenderPrefix(gender)}</strong> —{" "}
            {GENDER_LABEL[gender]}. Se utiliza para calcular el dígito
            verificador.
          </small>

          <div
            style={{
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {dni && dni.length >= 7 && dni.length <= 8 ? (
              generated ? (
                <>
                  <strong>CUIT generado: {generated}</strong>
                  <button
                    type="button"
                    className="button button--outlined"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    onClick={() =>
                      copyToClipboard(generated, setCopiedGenerated)
                    }
                  >
                    Copiar
                  </button>
                  {copiedGenerated && (
                    <span style={{ color: "var(--text-secondary)" }}>
                      ¡Copiado!
                    </span>
                  )}
                </>
              ) : (
                <span style={{ color: "var(--error)" }}>
                  No se pudo generar el CUIT. Revisá el DNI.
                </span>
              )
            ) : (
              <span style={{ color: "var(--text-secondary)" }}>
                Ingresá el DNI y elegí Hombre, Mujer o X.
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default GenerarCuit;
