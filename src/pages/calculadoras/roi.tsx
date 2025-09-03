import Head from "next/head";
import { RoiScreen } from "@/components";

export default function RoiPage() {
  return (
    <>
      <Head>
        <title>ROI Inmobiliario</title>
        <meta
          name="description"
          content="Calculá NOI, cap rate, cash-on-cash y payback de una inversión inmobiliaria."
        />
      </Head>
      <RoiScreen />
    </>
  );
}
