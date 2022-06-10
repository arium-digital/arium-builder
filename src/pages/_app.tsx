import { AppProps } from "next/app";
import Head from "next/head";
import "./styles/arium-site.scss";

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
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
