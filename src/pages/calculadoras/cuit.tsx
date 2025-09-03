import Head from "next/head";
import { CuitScreen } from "@/components";

export default function CuitPage() {
  return (
    <>
      <Head>
        <title>CUIT / DNI</title>
        <meta
          name="description"
          content="Validá un CUIT con formato en vivo o generálo desde DNI eligiendo Hombre, Mujer o X."
        />
      </Head>
      <CuitScreen />
    </>
  );
}
