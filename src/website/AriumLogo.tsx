export const LOGO_PATH = "/images/arium-logo-full.svg";
export const AriumLogo = ({ dark }: { dark?: boolean }) => {
  return (
    <img
      style={{ filter: dark ? "brightness(0.1888)" : undefined }}
      src={LOGO_PATH}
      alt="Arium Logo"
    />
  );
};
