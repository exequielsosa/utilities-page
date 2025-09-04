import Head from "next/head";
import Alquiler from "../../components/screens/AlquilerScreen/index";

export default function AumentoAlquilerPage() {
  return (
    <>
      <Head>
        <title>Aumento de alquiler (CER / UVA)</title>
        <meta
          name="description"
          content="Calculá el ajuste de alquiler por índice: factor = índice(fecha de ajuste) ÷ índice(fecha base)."
        />
      </Head>

      <Alquiler />
    </>
  );
}
