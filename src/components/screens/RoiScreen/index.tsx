import React, { useState } from "react";
import Head from "next/head";
import { computeROI } from "@/lib/roi";
import RoiForm, {
  RoiFormState,
  RoiErrors,
} from "@/components/organisms/RoiForm";
import RoiResults, { RoiResult } from "@/components/organisms/RoiResults";

const initialForm: RoiFormState = {
  price: "",
  initialCosts: "",
  rentMonthly: "",
  occupancyPct: "95",
  expensesMonthly: "0",
  taxesMonthly: "0",
  insuranceMonthly: "0",
  feesMonthly: "0",
  annualOther: "0",
};

export const RoiScreen = () => {
  const [form, setForm] = useState<RoiFormState>(initialForm);
  const [errors, setErrors] = useState<RoiErrors>({});
  const [result, setResult] = useState<RoiResult | null>(null);

  const num = (s: string) => Number((s || "0").replace(",", "."));

  const validate = () => {
    const e: RoiErrors = {};
    const price = num(form.price);
    const rent = num(form.rentMonthly);
    const occ = num(form.occupancyPct);

    if (!(price > 0)) e.price = "Ingresá un precio mayor a 0.";
    if (!(rent >= 0))
      e.rentMonthly = "Ingresá un alquiler mensual (0 si no aplica).";
    if (!(occ >= 0 && occ <= 100)) e.occupancyPct = "Debe estar entre 0 y 100.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) return;

    const i = {
      price: num(form.price),
      initialCosts: num(form.initialCosts),
      rentMonthly: num(form.rentMonthly),
      occupancyPct: num(form.occupancyPct),
      expensesMonthly: num(form.expensesMonthly),
      taxesMonthly: num(form.taxesMonthly),
      insuranceMonthly: num(form.insuranceMonthly),
      feesMonthly: num(form.feesMonthly),
      annualOther: num(form.annualOther),
    };

    setResult(computeROI(i));
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setResult(null);
  };

  const handleChange: RoiFormState extends infer T
    ? <K extends keyof RoiFormState>(key: K, value: string) => void
    : never = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setResult(null);
  };

  return (
    <>
      <Head>
        <title>ROI Inmobiliario</title>
        <meta
          name="description"
          content="Calculá NOI, cap rate, cash-on-cash y payback de una inversión inmobiliaria."
        />
      </Head>

      <main
        className="container"
        style={{ padding: "24px 0", display: "grid", gap: 24 }}
      >
        <header>
          <h1>ROI Inmobiliario</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Ingresá tus supuestos y obtené cap rate, cash-on-cash y payback.
          </p>
        </header>

        <RoiForm
          form={form}
          errors={errors}
          onChange={handleChange}
          onCalculate={handleCalculate}
          onReset={handleReset}
        />

        {result && <RoiResults result={result} />}
      </main>
    </>
  );
};

export default RoiScreen;
