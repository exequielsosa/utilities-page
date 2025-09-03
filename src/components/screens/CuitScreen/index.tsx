import { GenerarCuit, ValidarCuit } from "@/components/organisms";

export const CuitScreen = () => {
  return (
    <>
      <main
        className="container"
        style={{ paddingBlock: "24px", display: "grid", gap: 24 }}
      >
        <header>
          <h1>CUIT / DNI</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Validá un CUIT (XX-XXXXXXXX-X) o generálo a partir de un DNI
            indicando el género.
          </p>
        </header>

        <GenerarCuit />
        <ValidarCuit />
      </main>
    </>
  );
};

export default CuitScreen;
