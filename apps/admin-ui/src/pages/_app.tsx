import React from "react";
import type { AppProps } from "next/app";
import "hds-core/lib/base.css";
import "../index.scss";
import { isBrowser } from "@common/const";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "@common/apolloClient";
import { ExternalScripts } from "@component/ExternalScripts";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
      {isBrowser && <ExternalScripts />}
    </>
  );
}
