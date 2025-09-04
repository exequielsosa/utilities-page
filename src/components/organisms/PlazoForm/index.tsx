export type TipoPlazo = "TNA" | "UVA";

export type FormTNA = {
  capital: string;
  fechaInicio: string;
  fechaFin: string;
  tna: string; // como string para inputs controlados
  base: "365" | "360";
};

export type FormUVA = {
  capital: string;
  fechaInicio: string;
  fechaFin: string;
  spread: string; // % anual
};

type Props = {
  tipo: TipoPlazo;
  setTipo: (t: TipoPlazo) => void;

  formTNA: FormTNA;
  formUVA: FormUVA;

  onChangeTNA: <K extends keyof FormTNA>(k: K, v: FormTNA[K]) => void;
  onChangeUVA: <K extends keyof FormUVA>(k: K, v: FormUVA[K]) => void;

  onCalculate: () => void;
  onReset: () => void;
  error?: string;
};

const PlazoForm: React.FC<Props> = ({
  tipo,
  setTipo,
  formTNA,
  formUVA,
  onChangeTNA,
  onChangeUVA,
  onCalculate,
  onReset,
  error,
}) => {
  return (
    <section
      className="card"
      style={{ padding: 16, display: "grid", gap: 12, maxWidth: 760 }}
    >
      {/* Tipo */}
      <div>
        <label>Tipo</label>
        <div style={{ display: "flex", gap: 12 }}>
          <label
            style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
          >
            <input
              type="radio"
              name="tipo"
              checked={tipo === "TNA"}
              onChange={() => setTipo("TNA")}
            />
            Tradicional (TNA)
          </label>
          <label
            style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
          >
            <input
              type="radio"
              name="tipo"
              checked={tipo === "UVA"}
              onChange={() => setTipo("UVA")}
            />
            UVA
          </label>
        </div>
      </div>

      {/* Form TNA */}
      {tipo === "TNA" && (
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div>
            <label>Capital</label>
            <input
              inputMode="decimal"
              placeholder="Ej: 300000"
              value={formTNA.capital}
              onChange={(e) => onChangeTNA("capital", e.target.value)}
            />
          </div>
          <div>
            <label>Fecha inicio</label>
            <input
              type="date"
              value={formTNA.fechaInicio}
              onChange={(e) => onChangeTNA("fechaInicio", e.target.value)}
            />
          </div>
          <div>
            <label>Fecha fin</label>
            <input
              type="date"
              value={formTNA.fechaFin}
              onChange={(e) => onChangeTNA("fechaFin", e.target.value)}
            />
          </div>
          <div>
            <label>TNA %</label>
            <input
              inputMode="decimal"
              placeholder="Ej: 70"
              value={formTNA.tna}
              onChange={(e) => onChangeTNA("tna", e.target.value)}
            />
            <small style={{ color: "var(--text-secondary)" }}>
              Tasa Nominal Anual. La provee tu banco.
            </small>
          </div>
          <div>
            <label>Base</label>
            <select
              value={formTNA.base}
              onChange={(e) =>
                onChangeTNA("base", e.target.value as "365" | "360")
              }
            >
              <option value="365">365 (calendario)</option>
              <option value="360">360 (bancaria)</option>
            </select>
          </div>
        </div>
      )}

      {/* Form UVA */}
      {tipo === "UVA" && (
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          }}
        >
          <div>
            <label>Capital</label>
            <input
              inputMode="decimal"
              placeholder="Ej: 300000"
              value={formUVA.capital}
              onChange={(e) => onChangeUVA("capital", e.target.value)}
            />
          </div>
          <div>
            <label>Fecha inicio</label>
            <input
              type="date"
              value={formUVA.fechaInicio}
              onChange={(e) => onChangeUVA("fechaInicio", e.target.value)}
            />
          </div>
          <div>
            <label>Fecha fin</label>
            <input
              type="date"
              value={formUVA.fechaFin}
              onChange={(e) => onChangeUVA("fechaFin", e.target.value)}
            />
          </div>
          <div>
            <label>Spread anual % (opcional)</label>
            <input
              inputMode="decimal"
              placeholder="Ej: 1 (UVA + 1%)"
              value={formUVA.spread}
              onChange={(e) => onChangeUVA("spread", e.target.value)}
            />
            <small style={{ color: "var(--text-secondary)" }}>
              Interés compensatorio anual adicional a la UVA (si tu banco lo
              paga).
            </small>
          </div>
          <small
            style={{ gridColumn: "1 / -1", color: "var(--text-secondary)" }}
          >
            Fuente UVA: API de datos.gob.ar. Si no hay dato exacto, se usa el
            último ≤ a cada fecha.
          </small>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: "flex", gap: 8 }}>
        <button className="button" type="button" onClick={onCalculate}>
          Calcular
        </button>
        <button
          className="button button--outlined"
          type="button"
          onClick={onReset}
        >
          Limpiar
        </button>
      </div>

      {error && <small style={{ color: "var(--error)" }}>{error}</small>}
    </section>
  );
};

export default PlazoForm;
