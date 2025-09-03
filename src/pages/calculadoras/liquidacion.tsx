import Head from "next/head";
import LiquidacionScreen from "../../components/screens/LiquidacionScreen/index";

export default function LiquidacionPage() {
  return (
    <>
      <Head>
        <title>Liquidación Final (ARG)</title>
        <meta
          name="description"
          content="Calculadora de liquidación final por renuncia o despido sin causa (Argentina): salario proporcional, SAC, vacaciones no gozadas, antigüedad, preaviso e integración."
        />
      </Head>
      <LiquidacionScreen />
    </>
  );
}
