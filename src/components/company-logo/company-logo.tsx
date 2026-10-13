import Image from "next/image";
import styles from "./company-logo.module.css";

export const CompanyLogo = ({ size = 32 }: { size?: number }) => (
  <Image
    src="/larsen-utvikling.svg"
    alt=""
    width={size}
    height={size}
    className={styles.logo}
  />
);
