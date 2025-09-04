import Head from "next/head";
import PlazoFijo from "../../components/screens/PlazoFijoScreen";

export default function PlazoFijoPage() {
  return (
    <>
      <Head>
        <title>Plazo fijo (TNA / UVA)</title>
        <meta
          name="description"
          content="Simulá un plazo fijo tradicional (TNA) o UVA. Cálculo simple y transparente."
        />
      </Head>
      <PlazoFijo />
    </>
  );
}
