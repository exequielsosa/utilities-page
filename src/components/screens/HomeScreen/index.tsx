import Head from "next/head";
import { CalculatorCard } from "@/components/atoms";
import { CALCULATORS } from "@/data/calculators";

export const HomeScreen = () => {
  return (
    <>
      <Head>
        <title>Calculadoras | Utilities</title>
        <meta name="description" content="Calculadoras simples y útiles" />
      </Head>

      <main className="container" style={{ paddingBlock: "24px" }}>
        <header style={{ marginBottom: "16px" }}>
          <h1>Calculadoras</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Herramientas financieras e inmobiliarias simples.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {CALCULATORS.map((c) => (
            <CalculatorCard key={c.id} item={c} />
          ))}
        </section>
      </main>
    </>
  );
};

export default HomeScreen;
