export type PlazoResultadoData = {
  montoFinal: number;
  intereses: number;
  dias: number;
  detalle: Record<string, number | string>;
};

const PlazoResultado: React.FC<{ r: PlazoResultadoData }> = ({ r }) => {
  const money = (n: number) => n.toLocaleString("es-AR");
  return (
    <section
      className="card"
      style={{ padding: 16, display: "grid", gap: 8, maxWidth: 760 }}
    >
      <h2>Resultado</h2>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        <li>
          <strong>Días:</strong> {r.dias}
        </li>
        <li>
          <strong>Intereses/ajuste:</strong> {money(r.intereses)}
        </li>
        <li>
          <strong>Monto final:</strong> {money(r.montoFinal)}
        </li>
      </ul>

      <details>
        <summary style={{ cursor: "pointer" }}>Ver desglose</summary>
        <ul style={{ marginTop: 8, paddingLeft: 16 }}>
          {Object.entries(r.detalle).map(([k, v]) => (
            <li key={k}>
              <strong>{k}:</strong>{" "}
              {typeof v === "number" ? money(v) : String(v)}
            </li>
          ))}
        </ul>
      </details>

      <small style={{ color: "var(--text-secondary)" }}>
        Esto es una simulación informativa. Verificá condiciones con tu banco
        (mínimos, pre-cancelación, etc.).
      </small>
    </section>
  );
};

export default PlazoResultado;
