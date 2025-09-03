import Head from "next/head";
import { SacScreen } from "@/components";

export default function SacPage() {
  return (
    <>
      <Head>
        <title>Aguinaldo (SAC)</title>
        <meta
          name="description"
          content="Calculadora de aguinaldo: (mejor sueldo ÷ 2) × (días trabajados ÷ días del semestre)."
        />
      </Head>
      <SacScreen />
    </>
  );
}
