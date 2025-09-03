import { computeROI, fmtPct } from "@/lib/roi";

export type RoiResult = ReturnType<typeof computeROI>;

export const RoiResults = ({ result }: { result: RoiResult }) => {
  return (
    <section className="card" style={{ padding: 16, display: "grid", gap: 8 }}>
      <h2>Resultados</h2>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        <li>
          <strong>Ingreso anual:</strong>{" "}
          {result.incomeAnnual.toLocaleString("es-AR")}
        </li>
        <li>
          <strong>Gastos operativos anuales:</strong>{" "}
          {result.opexAnnual.toLocaleString("es-AR")}
        </li>
        <li>
          <strong>NOI:</strong> {result.NOI.toLocaleString("es-AR")}
        </li>
        <li>
          <strong>Cap rate:</strong> {fmtPct(result.capRate)}
        </li>
        <li>
          <strong>Cash-on-cash:</strong> {fmtPct(result.cashOnCash)}
        </li>
        <li>
          <strong>Payback (años):</strong>{" "}
          {Number.isFinite(result.paybackYears)
            ? result.paybackYears.toFixed(2)
            : "—"}
        </li>
      </ul>
      {result.NOI < 0 && (
        <small style={{ color: "var(--error)" }}>
          ⚠️ El NOI es negativo: revisá supuestos de renta, vacancia y gastos.
        </small>
      )}
    </section>
  );
};

export default RoiResults;
