import styles from "./styles.module.scss";
export const LOGO_PATH = "/images/arium-logo-full.svg";
export const AriumLogo = ({ href = "/" }: { href?: string }) => {
  return (
    <a href={href}>
      <img className={styles.logo} src={LOGO_PATH} alt="Arium Logo" />
    </a>
  );
};
