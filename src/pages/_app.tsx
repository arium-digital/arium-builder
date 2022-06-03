import { AppProps } from "next/app";
import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect } from "react";
import * as gtag from "../libs/gtag";

// import "../src/css/helpOverlay.scss";
// import "../src/css/space.scss";
// import "../src/css/onboarding.scss";
import "./styles/arium-site.scss";

const isProduction = process.env.NODE_ENV === "production";

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: URL) => {
      /* invoke analytics function only for production */
      if (isProduction) gtag.pageview(url);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
  // eslint-disable-next-line react/jsx-props-no-spreading
  return (
    <>
      <Head>
        <title key="title">Arium</title>
        <meta key="description" name="description" content="Arium" />
        <meta name="og:image" content="/meta-image.png" key="og:image" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
