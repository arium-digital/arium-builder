import React from "react";
import Link from "next/link";
import styles from "css/legalLinks.module.scss";
import Hidden from "@material-ui/core/Hidden";

const LegalLinks = React.memo(() => (
  <div className={styles.legalLinks}>
    <Link href="/privacy">Privacy Policy</Link>
    <Link href="/terms">Terms of Service</Link>
    <Hidden mdUp>
      <br />
    </Hidden>
    &copy;2021 Arium Virtual Technologies Inc.
  </div>
));

export default LegalLinks;
