import "../styles/globals.css";
import type { AppProps } from "next/app";

function CustomApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default CustomApp;
