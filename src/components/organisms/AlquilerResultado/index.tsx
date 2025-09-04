import React from "react";

export type AlquilerResultadoData = {
  factor: number;
  nuevoMonto: number;
  lastUpdated: string | null;
};

const AlquilerResultado: React.FC<{ r: AlquilerResultadoData }> = ({ r }) => {
  const money = (n: number) => n.toLocaleString("es-AR");
  return (
    <section
      className="card"
      style={{ padding: 16, display: "grid", gap: 8, maxWidth: 760 }}
    >
      <h2>Resultado</h2>
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        <li>
          <strong>Factor de ajuste:</strong> {r.factor.toFixed(6)}
        </li>
        <li>
          <strong>Nuevo monto:</strong> {money(r.nuevoMonto)}
        </li>
        {r.lastUpdated && (
          <li style={{ color: "var(--text-secondary)" }}>
            <small>Último dato de la serie: {r.lastUpdated}</small>
          </li>
        )}
      </ul>
      <small style={{ color: "var(--text-secondary)" }}>
        Tip: podés redondear el resultado (por ej. a $1.000) según tu política.
      </small>
    </section>
  );
};

export default AlquilerResultado;
