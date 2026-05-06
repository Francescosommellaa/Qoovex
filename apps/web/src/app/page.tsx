import type { AppProps } from "next/app";
import "./globals.css";

export default function WebApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
