export type RoiFormState = {
  price: string;
  initialCosts: string;
  rentMonthly: string;
  occupancyPct: string;
  expensesMonthly: string;
  taxesMonthly: string;
  insuranceMonthly: string;
  feesMonthly: string;
  annualOther: string;
};

export type RoiErrors = Partial<Record<keyof RoiFormState, string>>;

type Props = {
  form: RoiFormState;
  errors: RoiErrors;
  onChange: <K extends keyof RoiFormState>(key: K, value: string) => void;
  onCalculate: () => void;
  onReset: () => void;
};

export const RoiForm = ({
  form,
  errors,
  onChange,
  onCalculate,
  onReset,
}: Props) => {
  return (
    <section className="card" style={{ padding: 16, display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 12, maxWidth: 640 }}>
        {/* Precio de compra */}
        <div>
          <label>Precio de compra</label>
          <input
            inputMode="decimal"
            placeholder="Ej: 80000000"
            value={form.price}
            onChange={(e) => onChange("price", e.target.value)}
          />
          <small
            style={{
              color: errors.price ? "var(--error)" : "var(--text-secondary)",
            }}
          >
            Monto total pagado por la propiedad (sin incluir gastos de escritura
            ni comisión).
          </small>
          {errors.price && (
            <div style={{ color: "var(--error)" }}>{errors.price}</div>
          )}
        </div>

        {/* Gastos iniciales */}
        <div>
          <label>Gastos iniciales</label>
          <input
            inputMode="decimal"
            placeholder="Escritura, sellos, comisión, honorarios…"
            value={form.initialCosts}
            onChange={(e) => onChange("initialCosts", e.target.value)}
          />
          <small style={{ color: "var(--text-secondary)" }}>
            Suma de costos al comprar (escritura, impuestos, comisiones, etc.).
            Afecta el cash-on-cash y el payback.
          </small>
        </div>

        {/* Alquiler mensual */}
        <div>
          <label>Alquiler mensual</label>
          <input
            inputMode="decimal"
            placeholder="Ej: 250000"
            value={form.rentMonthly}
            onChange={(e) => onChange("rentMonthly", e.target.value)}
          />
          <small
            style={{
              color: errors.rentMonthly
                ? "var(--error)"
                : "var(--text-secondary)",
            }}
          >
            Renta bruta mensual esperada. Si hoy está vacío, poné 0.
          </small>
          {errors.rentMonthly && (
            <div style={{ color: "var(--error)" }}>{errors.rentMonthly}</div>
          )}
        </div>

        {/* Ocupación */}
        <div>
          <label>Ocupación %</label>
          <input
            inputMode="decimal"
            placeholder="0 a 100"
            value={form.occupancyPct}
            onChange={(e) => onChange("occupancyPct", e.target.value)}
          />
          <small
            style={{
              color: errors.occupancyPct
                ? "var(--error)"
                : "var(--text-secondary)",
            }}
          >
            Porcentaje del año que esperás tener alquilado (ej: 95 = ~11.4 meses
            ocupados).
          </small>
          {errors.occupancyPct && (
            <div style={{ color: "var(--error)" }}>{errors.occupancyPct}</div>
          )}
        </div>

        <div className="hr" />

        {/* Expensas + mantenimiento */}
        <div>
          <label>Expensas + mantenimiento (mensual)</label>
          <input
            inputMode="decimal"
            placeholder="Promedio mensual"
            value={form.expensesMonthly}
            onChange={(e) => onChange("expensesMonthly", e.target.value)}
          />
          <small style={{ color: "var(--text-secondary)" }}>
            Expensas ordinarias y costos de mantenimiento corrientes (pintura,
            arreglos menores), promediados por mes.
          </small>
        </div>

        {/* Impuestos */}
        <div>
          <label>Impuestos (mensual)</label>
          <input
            inputMode="decimal"
            placeholder="ABL, ARBA/Impuesto Inmobiliario, tasas"
            value={form.taxesMonthly}
            onChange={(e) => onChange("taxesMonthly", e.target.value)}
          />
          <small style={{ color: "var(--text-secondary)" }}>
            Impuestos prorrateados a valor mensual (ABL/municipales, ARBA o
            Inmobiliario provincial, etc.).
          </small>
        </div>

        {/* Seguro */}
        <div>
          <label>Seguro (mensual)</label>
          <input
            inputMode="decimal"
            placeholder="Seguro de hogar/propiedad"
            value={form.insuranceMonthly}
            onChange={(e) => onChange("insuranceMonthly", e.target.value)}
          />
          <small style={{ color: "var(--text-secondary)" }}>
            Prima mensual del seguro de la propiedad.
          </small>
        </div>

        {/* Honorarios administración */}
        <div>
          <label>Honorarios administración (mensual)</label>
          <input
            inputMode="decimal"
            placeholder="Si administrás con inmobiliaria"
            value={form.feesMonthly}
            onChange={(e) => onChange("feesMonthly", e.target.value)}
          />
          <small style={{ color: "var(--text-secondary)" }}>
            Comisión por administración de alquiler, si corresponde.
          </small>
        </div>

        {/* Otros costos anuales */}
        <div>
          <label>Otros costos (anual)</label>
          <input
            inputMode="decimal"
            placeholder="Gastos extraordinarios (anuales)"
            value={form.annualOther}
            onChange={(e) => onChange("annualOther", e.target.value)}
          />
          <small style={{ color: "var(--text-secondary)" }}>
            Gastos no mensuales o extraordinarios (reparaciones grandes,
            vacancia imprevista, etc.) expresados al año.
          </small>
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="button" className="button" onClick={onCalculate}>
            Calcular
          </button>
          <button
            type="button"
            className="button button--outlined"
            onClick={onReset}
          >
            Limpiar
          </button>
        </div>

        {/* Glosario */}
        <small style={{ color: "var(--text-secondary)" }}>
          <strong>Definiciones:</strong> NOI = Ingreso Operativo Neto = Ingresos
          anuales − Gastos operativos anuales. Cap rate = NOI ÷ Precio.
          Cash-on-cash = NOI ÷ (Precio + Gastos iniciales). Payback = (Precio +
          Gastos iniciales) ÷ NOI (años).
        </small>
      </div>
    </section>
  );
};

export default RoiForm;
