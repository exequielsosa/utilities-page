export type SerieSlug = "cer" | "uva";

export type AlquilerFormState = {
  indice: SerieSlug;
  montoActual: string;
  fechaBase: string;
  fechaAjuste: string;
};

type Props = {
  form: AlquilerFormState;
  error?: string;
  onChange: <K extends keyof AlquilerFormState>(
    k: K,
    v: AlquilerFormState[K]
  ) => void;
  onCalculate: () => void;
  onReset: () => void;
};

const AlquilerForm: React.FC<Props> = ({
  form,
  error,
  onChange,
  onCalculate,
  onReset,
}) => {
  return (
    <section
      className="card"
      style={{ padding: 16, display: "grid", gap: 12, maxWidth: 760 }}
    >
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <div>
          <label>Índice</label>
          <select
            value={form.indice}
            onChange={(e) => onChange("indice", e.target.value as SerieSlug)}
          >
            <option value="cer">CER (diario)</option>
            <option value="uva">UVA (diario)</option>
          </select>
          <small style={{ color: "var(--text-secondary)" }}>
            Fuente: API de datos.gob.ar
          </small>
        </div>

        <div>
          <label>Monto actual</label>
          <input
            inputMode="decimal"
            placeholder="Ej: 250000"
            value={form.montoActual}
            onChange={(e) => onChange("montoActual", e.target.value)}
          />
          <small style={{ color: "var(--text-secondary)" }}>
            Valor actual del alquiler (número). Acepta coma o punto decimal.
          </small>
        </div>

        <div>
          <label>Fecha base</label>
          <input
            type="date"
            value={form.fechaBase}
            onChange={(e) => onChange("fechaBase", e.target.value)}
          />
          <small style={{ color: "var(--text-secondary)" }}>
            AAAA-MM-DD (o podés tipear DD/MM/AAAA).
          </small>
        </div>

        <div>
          <label>Fecha de ajuste</label>
          <input
            type="date"
            value={form.fechaAjuste}
            onChange={(e) => onChange("fechaAjuste", e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
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

export default AlquilerForm;
