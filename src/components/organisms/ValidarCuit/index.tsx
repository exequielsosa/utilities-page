import { useMemo, useState } from "react";
import {
  onlyDigits,
  formatCuitMask,
  formatCUIT,
  isValidCUIT,
} from "@/lib/cuit";

export const ValidarCuit = () => {
  const [copiedValid, setCopiedValid] = useState(false);
  function handleCuitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = onlyDigits(e.target.value).slice(0, 11);
    setCuitInput(formatCuitMask(digits));
  }

  // Validar CUIT
  const [cuitInput, setCuitInput] = useState("");
  const valid = useMemo(() => {
    const digits = onlyDigits(cuitInput);
    if (!digits) return null;
    return isValidCUIT(digits);
  }, [cuitInput]);
  const formattedValid = useMemo(() => {
    const digits = onlyDigits(cuitInput);
    return digits ? formatCUIT(digits) : "";
  }, [cuitInput]);

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

  return (
    <>
      {/* Validar CUIT */}
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
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong
                style={{ color: valid ? "var(--success)" : "var(--error)" }}
              >
                {valid ? `CUIT válido: ${formattedValid}` : "CUIT inválido"}
              </strong>

              {valid && formattedValid && (
                <>
                  <button
                    type="button"
                    className="button button--outlined"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      fontSize: 14,
                    }}
                    onClick={() =>
                      copyToClipboard(formattedValid, setCopiedValid)
                    }
                  >
                    Copiar
                  </button>
                  {copiedValid && (
                    <span style={{ color: "var(--text-secondary)" }}>
                      ¡Copiado!
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ValidarCuit;
