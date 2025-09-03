import Link from "next/link";
import styles from "./CalculatorCard.module.scss";
import type { Calc } from "@/data/calculators";

export const CalculatorCard = ({ item }: { item: Calc }) => {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.category}>{item.category}</span>
        <h3 className={styles.title}>{item.title}</h3>
      </div>
      <p className={styles.desc}>{item.description}</p>
      <div className={styles.footer}>
        <Link className="button" href={item.href}>
          Abrir
        </Link>
      </div>
    </article>
  );
};

export default CalculatorCard;
