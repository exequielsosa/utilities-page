import Head from "next/head";
import { HomeScreen } from "@/components";

export default function Home() {
  return (
    <>
      <Head>
        <title>Utilidades!</title>
        <meta name="description" content="Generador de utilidades" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomeScreen />
    </>
  );
}
