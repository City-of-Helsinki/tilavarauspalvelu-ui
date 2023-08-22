// `pages/_app.js`
import React from "react";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import * as Sentry from "@sentry/nextjs";

import "hds-core/lib/base.css";
import "../index.scss";
import { nextAuthRoute, isBrowser, publicUrl } from "app/common/const";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "app/common/apolloClient";
import Error5xx from "app/common/Error5xx";
import ExternalScripts from "../common/ExternalScripts";

const FallbackComponent = (err: unknown) => {
  Sentry.captureException(err);
  return <Error5xx />;
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <SessionProvider session={pageProps.session} basePath={nextAuthRoute}>
        <ApolloProvider client={apolloClient}>
          {isBrowser ? (
            <BrowserRouter basename={publicUrl}>
              <ErrorBoundary FallbackComponent={FallbackComponent}>
                <Component {...pageProps} />
              </ErrorBoundary>
            </BrowserRouter>
          ) : (
            <ErrorBoundary FallbackComponent={FallbackComponent}>
              <Component {...pageProps} />
            </ErrorBoundary>
          )}
        </ApolloProvider>
      </SessionProvider>
      {isBrowser && <ExternalScripts />}
    </>
  );
}
