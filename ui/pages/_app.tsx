import React from "react";
import { appWithTranslation, UserConfig } from "next-i18next";
import { OidcProvider } from "@axa-fr/react-oidc-context";
// eslint-disable-next-line import/no-extraneous-dependencies
import { CustomHistory } from "@axa-fr/react-oidc/dist/core/routes/withRouter";
import queryString from "query-string";
import { format, isValid } from "date-fns";
import { useRouter } from "next/router";
import { AppProps } from "next/app";
import { fi } from "date-fns/locale";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../modules/apolloClient";
import SessionLost from "../components/common/SessionLost";
import PageWrapper from "../components/common/PageWrapper";
import { mockRequests } from "../modules/const";
import oidcConfiguration from "../modules/auth/configuration";
import nextI18NextConfig from "../next-i18next.config";
import "../styles/global.scss";
import { TrackingWrapper } from "../modules/tracking";
import { TransparentFullscreenSpinner } from "../components/common/FullscreenSpinner";
import { DataContextProvider } from "../context/DataContext";
import ExternalScripts from "../components/ExternalScripts";

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
          <OidcProvider
            callbackSuccessComponent={TransparentFullscreenSpinner}
            authenticatingComponent={TransparentFullscreenSpinner}
            loadingComponent={TransparentFullscreenSpinner}
            authenticatingErrorComponent={SessionLost}
            sessionLostComponent={SessionLost}
            configuration={oidcConfiguration}
            withCustomHistory={withCustomHistory}
          >
            <ApolloProvider client={apolloClient}>
              <PageWrapper {...pageProps}>
                <Component {...pageProps} />
              </PageWrapper>
            </ApolloProvider>
          </OidcProvider>
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
