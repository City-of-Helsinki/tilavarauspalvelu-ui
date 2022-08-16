import React from "react";
import { appWithTranslation, UserConfig } from "next-i18next";
import queryString from "query-string"; // eslint-disable-next-line import/no-extraneous-dependencies
import { CustomHistory } from "@axa-fr/react-oidc/dist/core/routes/withRouter";
import { format, isValid } from "date-fns";
import { useRouter } from "next/router";
import { AppProps } from "next/app";
import { fi } from "date-fns/locale";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../modules/apolloClient";
import PageWrapper from "../components/common/PageWrapper";
import { authEnabled, mockRequests } from "../modules/const";
import nextI18NextConfig from "../next-i18next.config";
import "../styles/global.scss";
import { TrackingWrapper } from "../modules/tracking";
import { DataContextProvider } from "../context/DataContext";
import ExternalScripts from "../components/ExternalScripts";
import OidcProviderWrapper from "../components/auth/OidcProviderWrapper";

if (mockRequests) {
  require("../mocks");
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const withCustomHistory: () => CustomHistory = () => {
    return {
      replaceState: (url?: string | null): void => {
        const { url: pathname, query } = queryString.parseUrl(url);
        router
          .replace({
            pathname,
            query,
          })
          .then(() => window.dispatchEvent(new Event("popstate")));
      },
    };
  };

  return (
    <>
      <DataContextProvider>
        <TrackingWrapper>
          <OidcProviderWrapper
            withCustomHistory={withCustomHistory}
            isEnabled={authEnabled}
          >
            <ApolloProvider client={apolloClient}>
              <PageWrapper {...pageProps}>
                <Component {...pageProps} />
              </PageWrapper>
            </ApolloProvider>
          </OidcProviderWrapper>
        </TrackingWrapper>
      </DataContextProvider>
      <ExternalScripts />
    </>
  );
}

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
