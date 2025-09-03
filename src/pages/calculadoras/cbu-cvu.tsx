import Head from "next/head";
import { CbuScreen } from "@/components";

export default function CbuCvuPage() {
  return (
    <>
      <Head>
        <title>Validador CBU / CVU</title>
        <meta
          name="description"
          content="Validá un CBU o CVU (22 dígitos) con verificación oficial por módulo 10."
        />
      </Head>
      <CbuScreen />
    </>
  );
}
