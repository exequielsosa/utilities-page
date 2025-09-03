import { ResultadoLiquidacion } from "@/lib/liquidacion";

type Props = {
  r: ResultadoLiquidacion;
  tipo: "RENUNCIA" | "DESPIDO_SIN_CAUSA";
};

export const LiquidacionResultados: React.FC<Props> = ({ r, tipo }) => {
  const money = (n: number) => n.toLocaleString("es-AR");
  return (
    <section className="card" style={{ padding: 16, display: "grid", gap: 8 }}>
      <h2>Resultado</h2>

      <ul style={{ margin: 0, paddingLeft: 16 }}>
        <li>
          <strong>Días trabajados en el mes:</strong> {r.diasTrabajadosMes}
        </li>
        <li>
          <strong>Salario por días del mes:</strong>{" "}
          {money(r.salarioDiasTrabajados)}
        </li>
        {r.otrosHaberesMesProporc > 0 && (
          <li>
            <strong>Otros haberes (proporcional):</strong>{" "}
            {money(r.otrosHaberesMesProporc)}
          </li>
        )}
        <li>
          <strong>SAC proporcional:</strong> {money(r.sacProporcional)}
        </li>
        <li>
          <strong>Vacaciones proporcionales (días):</strong>{" "}
          {r.vacacionesDiasProporcionales}
        </li>
        <li>
          <strong>Vacaciones no gozadas:</strong> {money(r.vacacionesNoGozadas)}
        </li>
        {r.sacSobreVacaciones > 0 && (
          <li>
            <strong>SAC sobre vacaciones no gozadas:</strong>{" "}
            {money(r.sacSobreVacaciones)}
          </li>
        )}

        {tipo === "DESPIDO_SIN_CAUSA" && (
          <>
            <li>
              <strong>Indemnización por antigüedad (art. 245):</strong>{" "}
              {money(r.indemnizacionAntiguedad || 0)}{" "}
              {r.aniosPara245 ? `(años computados: ${r.aniosPara245})` : ""}
            </li>
            {(r.preaviso || 0) > 0 && (
              <li>
                <strong>Indemnización sustitutiva de preaviso:</strong>{" "}
                {money(r.preaviso || 0)}
              </li>
            )}
            {(r.sacSobrePreaviso || 0) > 0 && (
              <li>
                <strong>SAC sobre preaviso:</strong>{" "}
                {money(r.sacSobrePreaviso || 0)}
              </li>
            )}
            {(r.integracionMes || 0) > 0 && (
              <li>
                <strong>Integración mes de despido (art. 233):</strong>{" "}
                {money(r.integracionMes || 0)}
              </li>
            )}
            {(r.sacSobreIntegracion || 0) > 0 && (
              <li>
                <strong>SAC sobre integración:</strong>{" "}
                {money(r.sacSobreIntegracion || 0)}
              </li>
            )}
          </>
        )}
      </ul>

      <div className="hr" />

      <p style={{ margin: 0, fontWeight: 600 }}>
        {tipo === "RENUNCIA" ? (
          <>Total por renuncia: {money(r.totalRenuncia || 0)}</>
        ) : (
          <>Total por despido sin causa: {money(r.totalDespido || 0)}</>
        )}
      </p>

      <details>
        <summary style={{ cursor: "pointer" }}>Ver desglose técnico</summary>
        <ul style={{ marginTop: 8, paddingLeft: 16 }}>
          {Object.entries(r.detalle).map(([k, v]) => (
            <li key={k}>
              <strong>{k}:</strong> {money(v)}
            </li>
          ))}
        </ul>
      </details>

      <small style={{ color: "var(--text-secondary)" }}>
        Esta es una estimación orientativa. Convenios, topes, adicionales, y
        particularidades pueden modificar los importes.
      </small>
    </section>
  );
};

export default LiquidacionResultados;
