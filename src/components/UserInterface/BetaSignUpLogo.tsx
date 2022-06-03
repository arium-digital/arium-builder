import styles from "css/controls.module.scss";
import clsx from "clsx";

const Logo = () => (
  <img
    src="/images/arium-logo-light.png"
    alt="The letter A"
    className={styles.topLeftIcon}
  />
);

export default function BetaSignUpLogo({
  openBetaSignupModule,
  mode = "short",
}: {
  openBetaSignupModule: (e: React.SyntheticEvent) => void;
  mode?: "multiText" | "short";
}) {
  return (
    <div className="d-flex flex-row">
      <a
        href="/"
        onClick={mode === "multiText" ? openBetaSignupModule : undefined}
        title="Sign up for our Beta"
        className={styles.betaSignUpLogo}
      >
        <Logo />
      </a>
      <div
        className={clsx(
          styles.betaSignUpText,
          "align-self-center d-none d-lg-block"
        )}
      >
        Hosted by <span>Arium</span>
        {mode === "multiText" && (
          <>
            <br />
            <a
              href="/"
              onClick={openBetaSignupModule}
              title="Sign up for our Beta"
              className={styles.betaSignUpLogo}
            >
              Sign up for our Beta
            </a>
          </>
        )}
      </div>
    </div>
  );
}
