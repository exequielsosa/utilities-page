import { InputsLiquidacion, TipoBaja } from "@/lib/liquidacion";

export type LiqErrors = Partial<
  Record<keyof InputsLiquidacion | "interno", string>
>;

type Props = {
  form: InputsLiquidacion;
  errors: LiqErrors;
  onChange: <K extends keyof InputsLiquidacion>(
    k: K,
    v: InputsLiquidacion[K]
  ) => void;
  onCalculate: () => void;
  onReset: () => void;
};

export const LiquidacionForm: React.FC<Props> = ({
  form,
  errors,
  onChange,
  onCalculate,
  onReset,
}) => {
  const help = (err?: string) => ({
    color: err ? "var(--error)" : "var(--text-secondary)",
  });

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <section
      className="card"
      style={{ padding: 16, display: "grid", gap: 12, maxWidth: 760 }}
    >
      {hasErrors && (
        <div
          style={{
            background: "rgba(255,0,0,.06)",
            border: "1px solid var(--error)",
            color: "var(--error)",
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <strong>Revisá los campos:</strong>
          <ul style={{ margin: "6px 0 0 16px" }}>
            {errors.fechaIngreso && <li>{errors.fechaIngreso}</li>}
            {errors.fechaEgreso && <li>{errors.fechaEgreso}</li>}
            {errors.sueldoMensual && <li>{errors.sueldoMensual}</li>}
            {errors.interno && <li>{errors.interno}</li>}
          </ul>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {/* Tipo de baja */}
        <div>
          <label>Tipo de desvinculación</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {(["RENUNCIA", "DESPIDO_SIN_CAUSA"] as TipoBaja[]).map((t) => (
              <label
                key={t}
                style={{ display: "inline-flex", gap: 6, alignItems: "center" }}
              >
                <input
                  type="radio"
                  name="tipo"
                  checked={form.tipo === t}
                  onChange={() => onChange("tipo", t)}
                />
                {t === "RENUNCIA" ? "Renuncia" : "Despido sin causa"}
              </label>
            ))}
          </div>
          <small style={help()}>
            {form.tipo === "RENUNCIA"
              ? "Se calcula salario por días trabajados, SAC proporcional y vacaciones no gozadas (con SAC)."
              : "Además suma antigüedad (art. 245), preaviso omitido (art. 232), integración de mes (art. 233) y sus SAC."}
          </small>
        </div>

        {/* Fechas */}
        <div
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          <div>
            <label>Fecha de ingreso</label>
            <input
              type="date"
              value={form.fechaIngreso}
              onChange={(e) => onChange("fechaIngreso", e.target.value)}
            />
            <small style={help(errors.fechaIngreso)}>
              Acepta AAAA-MM-DD. También podés tipear DD/MM/AAAA y lo
              normalizamos al calcular.
            </small>
          </div>
          <div>
            <label>Fecha de egreso</label>
            <input
              type="date"
              value={form.fechaEgreso}
              onChange={(e) => onChange("fechaEgreso", e.target.value)}
            />
            <small style={help(errors.fechaEgreso)}>
              Acepta AAAA-MM-DD o DD/MM/AAAA. Verificamos que la fecha exista.
            </small>
          </div>
        </div>

        {/* Remuneraciones base */}
        <div
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          <div>
            <label>Sueldo mensual actual</label>
            <input
              inputMode="decimal"
              value={form.sueldoMensual}
              onChange={(e) =>
                onChange(
                  "sueldoMensual",
                  Number((e.target.value || "0").replace(",", "."))
                )
              }
            />
            <small style={help(errors.sueldoMensual)}>
              Remuneración normal y habitual al cese. Base para días del mes,
              vacaciones y preaviso/integración.
            </small>
          </div>
          <div>
            <label>BMNH (art. 245)</label>
            <input
              inputMode="decimal"
              value={form.bmnhArt245 ?? ""}
              placeholder="Opcional"
              onChange={(e) =>
                onChange(
                  "bmnhArt245",
                  Number((e.target.value || "0").replace(",", ".")) || undefined
                )
              }
            />
            <small style={help()}>
              Mejor remuneración mensual normal y habitual (12 meses). Si vacío,
              usamos sueldo mensual actual.
            </small>
          </div>
          <div>
            <label>Mejor sueldo del semestre (SAC)</label>
            <input
              inputMode="decimal"
              value={form.mejorSueldoSemestre ?? ""}
              placeholder="Opcional"
              onChange={(e) =>
                onChange(
                  "mejorSueldoSemestre",
                  Number((e.target.value || "0").replace(",", ".")) || undefined
                )
              }
            />
            <small style={help()}>
              Si vacío, usamos sueldo mensual actual.
            </small>
          </div>
        </div>

        {/* Parámetros de mes y extras */}
        <div
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          <div>
            <label>Días trabajados en el mes</label>
            <input
              inputMode="numeric"
              value={form.diasMesTrabajadosExtra ?? ""}
              placeholder="Auto por fecha (opcional)"
              onChange={(e) =>
                onChange(
                  "diasMesTrabajadosExtra",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
            <small style={help()}>
              Si lo dejás vacío, calculo desde el 1 hasta el día de egreso (base
              30).
            </small>
          </div>
          <div>
            <label>Otros haberes del mes</label>
            <input
              inputMode="decimal"
              value={form.otrosHaberesMes ?? 0}
              onChange={(e) =>
                onChange(
                  "otrosHaberesMes",
                  Number((e.target.value || "0").replace(",", ".")) || 0
                )
              }
            />
            <small style={help()}>
              Premios/comisiones a prorratear por días trabajados.
            </small>
          </div>
          <div>
            <label>¿Calcular SAC sobre vacaciones?</label>
            <select
              value={form.aplicarSACSobreVacaciones ?? true ? "si" : "no"}
              onChange={(e) =>
                onChange("aplicarSACSobreVacaciones", e.target.value === "si")
              }
            >
              <option value="si">Sí (recomendado)</option>
              <option value="no">No</option>
            </select>
            <small style={help()}>
              Suele incluirse el 8,33% sobre vacaciones no gozadas.
            </small>
          </div>
        </div>

        {/* Solo despido sin causa */}
        {form.tipo === "DESPIDO_SIN_CAUSA" && (
          <>
            <div className="hr" />
            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              <div>
                <label>¿Hubo preaviso?</label>
                <select
                  value={form.huboPreaviso ? "si" : "no"}
                  onChange={(e) =>
                    onChange("huboPreaviso", e.target.value === "si")
                  }
                >
                  <option value="no">
                    No (liquida preaviso + integración)
                  </option>
                  <option value="si">Sí</option>
                </select>
                <small style={help()}>
                  Si no hubo, corresponde indemnización sustitutiva.
                </small>
              </div>
              <div>
                <label>¿Período de prueba?</label>
                <select
                  value={form.periodoPrueba ? "si" : "no"}
                  onChange={(e) =>
                    onChange("periodoPrueba", e.target.value === "si")
                  }
                >
                  <option value="no">No</option>
                  <option value="si">Sí</option>
                </select>
                <small style={help()}>
                  En prueba: preaviso = 15 días (½ sueldo).
                </small>
              </div>
            </div>
          </>
        )}

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
      </div>
    </section>
  );
};

export default LiquidacionForm;
export type { Props as LiquidacionFormProps };
