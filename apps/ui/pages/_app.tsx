import React from "react";
import { ApolloProvider } from "@apollo/client";
import { appWithTranslation, UserConfig } from "next-i18next";
import type { AppProps } from "next/app";
import { fi } from "date-fns/locale";
import { format, isValid } from "date-fns";
import { ThemeProvider } from "styled-components";
import { theme } from "common";
import PageWrapper from "../components/common/PageWrapper";
import ExternalScripts from "../components/ExternalScripts";
import { DataContextProvider } from "../context/DataContext";
import { createApolloClient } from "../modules/apolloClient";
import { isBrowser, mockRequests } from "../modules/const";
import { TrackingWrapper } from "../modules/tracking";
import nextI18NextConfig from "../next-i18next.config";
import "../styles/global.scss";
import { initMocks } from "../mocks";

if (mockRequests) {
  // await required otherwise the MSW is reqistered after the fetches are made
  await initMocks();
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <DataContextProvider>
        <TrackingWrapper>
          {/* TODO is this ever called on the server? then the ctx is not undefined */}
          <ApolloProvider client={createApolloClient(undefined)}>
            <ThemeProvider theme={theme}>
              <PageWrapper {...pageProps}>
                <Component {...pageProps} />
              </PageWrapper>
            </ThemeProvider>
          </ApolloProvider>
        </TrackingWrapper>
      </DataContextProvider>
      {isBrowser && <ExternalScripts />}
    </>
  );
};

export default appWithTranslation(MyApp, {
  ...(nextI18NextConfig as UserConfig),
  interpolation: {
    format: (value, fmt, lng) => {
      const locales = { fi };
      if (value instanceof Date && isValid(value))
        return format(value, fmt || "d.M.yyyy", { locale: locales[lng] });
      return value;
    },
    escapeValue: false,
  },
});
