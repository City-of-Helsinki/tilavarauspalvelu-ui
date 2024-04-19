import React, { useState, type FC, useEffect } from "react";
import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
/* eslint-disable import/no-duplicates */
import { fi } from "date-fns/locale";
import { format, isValid } from "date-fns";
/* eslint-enable import/no-duplicates */
import { ThemeProvider } from "styled-components";
import { theme } from "common";
import PageWrapper from "@/components/common/PageWrapper";
import { ExternalScripts } from "@/components/ExternalScripts";
import { DataContextProvider } from "@/context/DataContext";
import { createApolloClient, getCsrfToken } from "@/modules/apolloClient";
import { TrackingWrapper } from "@/modules/tracking";
import nextI18NextConfig from "@/next-i18next.config";
import "common/styles/variables.css";
import "@/styles/global.scss";

/// Have to handle async client creation so need a hook (React has no async components).
function useApolloClient(apiBaseUrl: string) {
  const [client, setClient] = useState<
    ApolloClient<NormalizedCacheObject> | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!apiBaseUrl || client || isLoading) {
      return;
    }
    async function createClient() {
      setIsLoading(true);
      // Make sure we have the CSRF token before creating the client.
      // This sets the client cookie used by futher requests, so we can ignore the return value.
      await getCsrfToken(apiBaseUrl);
      const c = await createApolloClient(apiBaseUrl, undefined);
      setClient(c);
      setIsLoading(false);
    }
    createClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- don't refresh if client or loading
  }, [apiBaseUrl]);

  return { client };
}

const MyApp = ({ Component, pageProps }: AppProps) => {
  const { hotjarEnabled, matomoEnabled, cookiehubEnabled, apiBaseUrl } =
    pageProps;
  const { client } = useApolloClient(apiBaseUrl);

  // Can't render without apollo client, and it's creation is async
  if (!client) {
    return null;
  }
  return (
    <>
      <DataContextProvider>
        <TrackingWrapper matomoEnabled={matomoEnabled}>
          {/* TODO is this ever called on the server? then the ctx is not undefined */}
          <ApolloProvider client={client}>
            <ThemeProvider theme={theme}>
              <PageWrapper {...pageProps}>
                <Component {...pageProps} />
              </PageWrapper>
            </ThemeProvider>
          </ApolloProvider>
        </TrackingWrapper>
      </DataContextProvider>
      <ExternalScripts
        cookiehubEnabled={cookiehubEnabled}
        matomoEnabled={matomoEnabled}
        hotjarEnabled={hotjarEnabled}
      />
    </>
  );
};

// NOTE functions are not serializable so we have to overload them here (instead of the js config)
// NOTE infered type problem so casting to FC
export default appWithTranslation(MyApp, {
  ...nextI18NextConfig,
  interpolation: {
    format: (value, fmt, _lng) => {
      if (value instanceof Date && isValid(value))
        return format(value, fmt || "d.M.yyyy", { locale: fi });
      return value;
    },
    escapeValue: false,
  },
}) as FC;
